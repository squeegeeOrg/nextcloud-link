import { NotFoundError } from "../source/errors";
import NextcloudClient   from "../source/client";
import configuration     from "./configuration";
import * as Stream       from "stream";
import { Request } from 'request'
import {
  createFileDetailProperty,
  createOwnCloudFileDetailProperty,
  createNextCloudFileDetailProperty
} from '../source/helper';

describe("Webdav integration", function testWebdavIntegration() {
  const client = new NextcloudClient(configuration);

  beforeEach(async () => {
    const files = await client.getFiles("/");

    await Promise.all(files.map(async function (file) {
      await client.remove(`/${file}`);
    }));
  });

  describe("checkConnectivity()", () => {
    it("should return false if there is no connectivity", async () => {
      const badClient = new NextcloudClient(Object.assign({}, configuration, {
        url: "http://127.0.0.1:65530"
      }));

      expect(await client.checkConnectivity()).toBe(true);
      expect(await badClient.checkConnectivity()).toBe(false);
    });
  });

  describe("exists(path)", () => {
    it("should return true if the given resource exists, false otherwise", async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.put(path, "");

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it("should not crash for nested folders", async () => {
      const path = `${randomRootPath()}${randomRootPath()}`;

      expect(await client.exists(path)).toBe(false);
    });
  });

  describe("404s", () => {
    it("should throw 404s when a resource is not found", async () => {
      const path  = randomRootPath();
      const path2 = randomRootPath();

      const nested = `${path}${path2}`;

      const stream = new Stream.Readable();

      try { await client.get(path);                  } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getFiles(path);             } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.put(nested, "");            } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.rename(path, path2);        } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getReadStream(path);        } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getWriteStream(nested);     } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.pipeStream(nested, stream); } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
    });
  });

  describe("put & get", () => {
    it("should allow to save and get files without streaming", async () => {
      const path   = randomRootPath();
      const string = "test";

      expect(await client.exists(path)).toBe(false);

      await client.put(path, string);

      expect((await client.get(path)).toString()).toBe(string);

      await client.remove(path);
    });

    it("should save a Buffer and get the file without streaming", async () => {
        const path = randomRootPath();
        const string = "tėŠt àáâèéî";
        const buffer = Buffer.from(string);

        expect(await client.exists(path)).toBe(false);

        await client.put(path, buffer);

        expect((await  client.get(path)).toString()).toBe(string);

        await client.remove(path);
    });
  });

  describe("remove(path)", () => {
    it("should remove simple files properly", async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.put(path, "");

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);

      expect(await client.exists(path)).toBe(false);
    });

    it("should remove folders recursively", async () => {
      const path = randomRootPath();

      const file = `${path}${path}`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.put(file, "");

      await client.remove(path);

      expect(await client.exists(file)).toBe(false);
      expect(await client.exists(path)).toBe(false);
    });
  });

  describe("touchFolder(path)", () => {
    it("should create folders", async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it("should allow folders with spaces in their names", async () => {
      const path = `${randomRootPath()} test`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it("should not complain if the folder already exists", async () => {
      const path = `${randomRootPath()} test`;

      await client.touchFolder(path);
      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it("should allow folders with accented characters", async () => {
      const path = `${randomRootPath()} testé`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });
  });

  describe("getFiles(path)", () => {
    it("should retrieve lists of files in a given folder", async () => {
      const path = randomRootPath();

      const fileName1 = "file1";
      const fileName2 = "file2";

      const file1 = `${path}/${fileName1}`;
      const file2 = `${path}/${fileName2}`;

      await client.touchFolder(path);
      await client.put(file1, "");
      await client.put(file2, "");

      expect(await client.exists(path)).toBe(true);
      expect(await client.exists(file1)).toBe(true);
      expect(await client.exists(file2)).toBe(true);

      const files = await client.getFiles(path);

      expect(files.length).toBe(2);
      expect(files.includes(fileName1)).toBe(true);
      expect(files.includes(fileName2)).toBe(true);

      await client.remove(path);
    });
  });

  describe("getFolderFileDetails(path)", () => {
    it("should retrieve lists of files in a given folder", async () => {
      const path = randomRootPath();

      const fileName1 = "file1";
      const fileName2 = "file2";

      const file1 = `${path}/${fileName1}`;
      const file2 = `${path}/${fileName2}`;

      await client.touchFolder(path);
      await client.touchFolder(file1);
      await client.put(file2, "");

      const files = await client.getFolderFileDetails(path);

      expect(files.length).toBe(2);

      expect(files[0].isFile).toBeFalsy();
      expect(files[0].name).toBe(fileName1);
      expect(files[0].isDirectory).toBeTruthy();
      expect(files[0].creationDate).toBeFalsy();
      expect(files[0].lastModified).toBeTruthy();
      expect(files[0].href).toBe(`/remote.php/dav/files/nextcloud${path}/${fileName1}`);

      expect(files[1].isFile).toBeTruthy();
      expect(files[1].name).toBe(fileName2);
      expect(files[1].isDirectory).toBeFalsy();
      expect(files[1].creationDate).toBeFalsy();
      expect(files[1].lastModified).toBeTruthy();
      expect(files[1].href).toBe(`/remote.php/dav/files/nextcloud${path}/${fileName2}`);

      await client.remove(path);
    });
  });

  describe("createFolderHierarchy(path)", () => {
    it("should create hierarchies properly, even when part of it already exists", async () => {
      const path = randomRootPath();

      const subFolder1 = "sub1";
      const subFolder2 = "sub2";
      const subFolder3 = "sub3";

      await client.touchFolder(path);

      const subFolder1Path = `${path}/${subFolder1}`;

      const subFolder2Path = `${subFolder1Path}/${subFolder2}`;

      const subFolder3Path = `${subFolder2Path}/${subFolder3}`;

      await client.createFolderHierarchy(subFolder3Path);

      expect(await client.exists(path)).toBe(true);
      expect(await client.exists(subFolder1Path)).toBe(true);
      expect(await client.exists(subFolder2Path)).toBe(true);
      expect(await client.exists(subFolder3Path)).toBe(true);

      await client.remove(path);
    });
  });

  describe("rename(path, newName)", () => {
    it("should work on simple files", async () => {
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${renamed}`;

      await client.put(source, "");

      expect(await client.exists(source)).toBe(true);

      await client.rename(source, renamed);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBe(true);

      await client.remove(renamedPath);
    });

    it("should work on folders too", async () => {
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${renamed}`;

      await client.touchFolder(source);

      expect(await client.exists(source)).toBe(true);

      await client.rename(source, renamed);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBe(true);

      await client.remove(renamedPath);
    });
  });

  describe("move(path, newName)", () => {
    it("should work on simple files", async () => {
      const folder  = randomRootPath();
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${folder}/${renamed}`;

      await client.createFolderHierarchy(folder);

      await client.put(source, "");

      expect(await client.exists(source)).toBe(true);

      await client.move(source, renamedPath);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBe(true);

      await client.remove(renamedPath);
    });

    it("should work on folders too", async () => {
      const folder  = randomRootPath();
      const source  = randomRootPath();
      const file    = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const sourceFilePath    = `${source}${file}`;
      const renamedFolderPath = `${folder}/${renamed}`;

      const renamedPathFile = `${renamedFolderPath}${file}`;

      await client.createFolderHierarchy(folder);
      await client.createFolderHierarchy(source);

      await client.put(sourceFilePath, "");

      expect(await client.exists(source)).toBe(true);

      await client.move(source, renamedFolderPath);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPathFile)).toBe(true);
      expect(await client.exists(renamedFolderPath)).toBe(true);

      await client.remove(renamedFolderPath);
    });
  });

  describe("getReadStream(path)", () => {
    it("should be able to stream files off of Nextcloud instances", async () => {
      const string = "test";
      const path   = randomRootPath();

      let data = "";

      await client.put(path, string);

      const stream = await client.getReadStream(path);

      stream.on("data", chunk => data += chunk.toString());

      await new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      });

      expect(data).toBe(string);

      await client.remove(path);
    });
  });

  describe("getWriteStream(path)", () => {
    it("should pipe readable streams to the Nextcloud instance", async () => {
      const string = "test";
      const path   = randomRootPath();

      const stream : Request = await client.getWriteStream(path);

      expect(stream instanceof Stream).toBe(true);

      await new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);

        stream.write(string);
        stream.end();
      });

      expect(await client.get(path)).toBe(string);

      await client.remove(path);
    });
  });

  describe("pipeStream(path, stream)", () => {
    it("should pipe readable streams to the Nextcloud instance", async () => {
      const string = "test";
      const path   = randomRootPath();

      const stream = getStream(string);

      await client.pipeStream(path, stream);

      expect(await client.get(path)).toBe(string);

      await client.remove(path);
    });
  });

  describe("Path reservation", () => {
    it("should allow saving a file with empty contents, then getting a write stream for it immediately", async () => {
      const path = randomRootPath();

      await client.put(path, "");

      const writeStream : Request = await client.getWriteStream(path);

      const writtenStream = getStream("test");

      const completionPromise = new Promise((resolve, reject) => {
        writeStream.on("end", resolve);
        writeStream.on("error", reject);
      });

      writtenStream.pipe(writeStream);

      await completionPromise;
    });
  });

  describe("file info", () => {
    const path = '/Shared/'
    const file1 = 'file1.txt';

    it("should retrieve extra properties when requested", async () => {
      await client.put(`${path}${file1}`, '');

      let folderDetails = await client.getFolderFileDetails(path, [
        createOwnCloudFileDetailProperty('fileid', true),
        createOwnCloudFileDetailProperty('size', true),
        createOwnCloudFileDetailProperty('owner-id'),
        createNextCloudFileDetailProperty('has-preview', true),
        createFileDetailProperty('http://doesnt/exist', 'de', 'test', false),
        createFileDetailProperty('http://doesnt/exist', 'de', 'test2', false, 42),
        createFileDetailProperty('http://doesnt/exist', 'de', 'test3', true),
        createFileDetailProperty('http://doesnt/exist', 'de', 'test4', true, 37),
      ]);

      folderDetails = folderDetails.filter(data => {
        return data.type === 'file'
      });

      const fileDetails = folderDetails[0];
      expect(fileDetails.extraProperties['owner-id']).toBe('nextcloud');
      expect(fileDetails.extraProperties['has-preview']).toBe(false);
      expect(fileDetails.extraProperties['test']).toBeUndefined();
      expect(fileDetails.extraProperties['test2']).toBe(42);
      expect(fileDetails.extraProperties['test3']).toBeUndefined();
      expect(fileDetails.extraProperties['test4']).toBe(37);
      expect(fileDetails.extraProperties['test999']).toBeUndefined();
    });

    it("should retrieve the activity information of a file", async () => {
        await client.put(`${path}${file1}`, '');
        let folderDetails = await client.getFolderFileDetails(path, [
          createOwnCloudFileDetailProperty('fileid', true),
        ]);
        folderDetails = folderDetails.filter(data => {
            return data.type === 'file'
        });

        const fileDetails = folderDetails[0];
        expect(fileDetails.extraProperties['fileid']).toBeDefined();

        const activity = (await client.getActivities(fileDetails.extraProperties['fileid'] as string | number)).filter(activity => activity.type === 'file_created')[0];

        expect(activity.user).toBe('nextcloud');
    });
  });
});

function randomRootPath(): string {
  return `/${Math.floor(Math.random() * 1000000000)}`;
}

function getStream(string): Stream.Readable {
  let stream = new Stream.Readable();

  // See https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
  stream._read = () => {};

  stream.push(string);
  stream.push(null);

  return stream;
}
