/// <reference types="node" />
import * as Webdav from 'webdav-client';
import * as Stream from 'stream';
import { configureWebdavConnection, checkConnectivity } from './webdav';
import { getCreatorByPath, getCreatorByFileId } from './common';
import { configureOcsConnection } from './ocs/ocs';
import { OcsUser, OcsNewUser } from './ocs/types';
import { ConnectionOptions, NextcloudClientInterface, NextcloudClientProperties } from './types';
export declare class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
    configureWebdavConnection: typeof configureWebdavConnection;
    configureOcsConnection: typeof configureOcsConnection;
    createFolderHierarchy: (sanePath: string) => Promise<void>;
    getFolderFileDetails: (sanePath: string, extraProperties?: Webdav.ConnectionReaddirProperty[]) => Promise<Webdav.ConnectionReaddirComplexResult[]>;
    getFolderProperties: (sanePath: string, extraProperties?: Webdav.ConnectionReaddirProperty[]) => Promise<Webdav.Properties>;
    checkConnectivity: typeof checkConnectivity;
    getWriteStream: (sanePath: string) => Promise<Webdav.Stream>;
    getReadStream: (sanePath: string) => Promise<Webdav.Stream>;
    touchFolder: (sanePath: string) => Promise<void>;
    pipeStream: (sanePath: string, stream: Stream) => Promise<void>;
    getFiles: (sanePath: string) => Promise<string[]>;
    rename: (saneFrom: string, newName: string) => Promise<void>;
    remove: (sanePath: string) => Promise<void>;
    exists: (sanePath: string) => Promise<boolean>;
    move: (saneFrom: string, toPath: string) => Promise<void>;
    put: (sanePath: string, content: Webdav.ContentType) => Promise<void>;
    get: (sanePath: string) => Promise<string>;
    getCreatorByPath: typeof getCreatorByPath;
    getCreatorByFileId: typeof getCreatorByFileId;
    activities: {
        get: (fileId: string | number, sort?: "asc" | "desc", limit?: number, sinceActivityId?: number) => Promise<import("./types").OcsActivity[]>;
    };
    users: {
        get: (userId: string) => Promise<OcsUser>;
        removeFromGroup: () => Promise<void>;
        setSubAdmin: (isSubAdmin: boolean) => Promise<void>;
        setEnabled: (isEnabled: boolean) => Promise<void>;
        addToGroup: () => Promise<void>;
        getGroups: () => Promise<void>;
        delete: (userId: string) => Promise<boolean>;
        list: () => Promise<string[]>;
        edit: () => Promise<void>;
        add: (user: OcsNewUser) => Promise<boolean>;
    };
    groups: {
        list: (search?: string, limit?: number, offset?: number) => Promise<string[]>;
        add: (groupId: string) => Promise<boolean>;
        delete: (groupId: string) => Promise<boolean>;
        getUsers: (groupId: string) => Promise<string[]>;
        getSubAdmins: (groupId: string) => Promise<string[]>;
    };
    constructor(options: ConnectionOptions);
    as(username: string, password: string): NextcloudClient;
}
export default NextcloudClient;
