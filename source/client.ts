import * as Webdav from 'webdav-client';
import * as Stream from 'stream';

import {
  configureWebdavConnection,
  createFolderHierarchy,
  getFolderFileDetails,
  checkConnectivity,
  getWriteStream,
  getReadStream,
  touchFolder,
  pipeStream,
  getFiles,
  rename,
  remove,
  exists,
  move,
  put,
  get
} from './webdav';

import {
  configureOcsConnection,
  activitiesGet,
  usersGetUser,
} from './ocs/ocs';

import {
  ConnectionOptions,
  NextcloudClientInterface,
  NextcloudClientProperties
} from './types';

export class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
  configureWebdavConnection = configureWebdavConnection;
  createFolderHierarchy     = createFolderHierarchy;
  getFolderFileDetails      = getFolderFileDetails;
  checkConnectivity         = checkConnectivity;
  getWriteStream            = getWriteStream;
  getReadStream             = getReadStream;
  touchFolder               = touchFolder;
  pipeStream                = pipeStream;
  getFiles                  = getFiles;
  rename                    = rename;
  remove                    = remove;
  exists                    = exists;
  move                      = move;
  put                       = put;
  get                       = get;

  // TODO: OCS - Move this into proper-order in list above.
  configureOcsConnection    = configureOcsConnection;
  activitiesGet             = activitiesGet;

  usersGetUser              = usersGetUser;

  constructor(options: ConnectionOptions) {
    super();

    this.username = options.username;
    this.url      = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;

    this.configureWebdavConnection(options);
    this.configureOcsConnection(options);
  }

  as(username: string, password: string): NextcloudClient {
    return new NextcloudClient({ username, password, url: this.url });
  }
}

// Shush, Typescript…
export default NextcloudClient;

// Support default import syntax for Node and TS, and also a named export.
module.exports = Object.assign(NextcloudClient, { NextcloudClient, default: NextcloudClient });
