/// <reference types="node" />
import * as Webdav from 'webdav-client';
import * as Stream from 'stream';
import { configureWebdavConnection, checkConnectivity } from './webdav';
import { PropertiesClient } from './properties/PropertiesClient';
import { getCreatorByFileId, getCreatorByPath } from './common';
import { configureOcsConnection } from './ocs/ocs';
import { OcsSharePermissions, OcsEditUserField, OcsShareType, OcsNewUser, OcsUser } from './ocs/types';
import { NextcloudClientProperties, NextcloudClientInterface, ConnectionOptions } from './types';
export declare class NextcloudClient extends NextcloudClientProperties implements NextcloudClientInterface {
    configureWebdavConnection: typeof configureWebdavConnection;
    configureOcsConnection: typeof configureOcsConnection;
    createFolderHierarchy: (sanePath: string) => Promise<void>;
    getFolderFileDetails: (sanePath: string, extraProperties?: Webdav.ConnectionReaddirProperty[]) => Promise<Webdav.ConnectionReaddirComplexResult[]>;
    getFolderProperties: (sanePath: string, extraProperties?: Webdav.ConnectionReaddirProperty[]) => Promise<Webdav.Properties>;
    setFolderProperties: (sanePath: string, properties: Webdav.Properties[]) => Promise<void>;
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
    put: (sanePath: string, content: string | Buffer) => Promise<void>;
    get: (sanePath: string) => Promise<string>;
    readonly properties: PropertiesClient;
    getCreatorByFileId: typeof getCreatorByFileId;
    getCreatorByPath: typeof getCreatorByPath;
    activities: {
        get: (fileId: string | number, sort?: "asc" | "desc", limit?: number, sinceActivityId?: number) => Promise<import("./types").OcsActivity[]>;
    };
    users: {
        removeSubAdminFromGroup: (userId: string, groupId: string) => Promise<boolean>;
        addSubAdminToGroup: (userId: string, groupId: string) => Promise<boolean>;
        resendWelcomeEmail: (userId: string) => Promise<boolean>;
        getSubAdminGroups: (userId: string) => Promise<string[]>;
        removeFromGroup: (userId: string, groupId: string) => Promise<boolean>;
        setEnabled: (userId: string, isEnabled: boolean) => Promise<boolean>;
        addToGroup: (userId: string, groupId: string) => Promise<boolean>;
        getGroups: (userId: string) => Promise<string[]>;
        delete: (userId: string) => Promise<boolean>;
        edit: (userId: string, field: OcsEditUserField, value: string) => Promise<boolean>;
        list: (search?: string, limit?: number, offset?: number) => Promise<string[]>;
        add: (user: OcsNewUser) => Promise<boolean>;
        get: (userId: string) => Promise<OcsUser>;
    };
    groups: {
        getSubAdmins: (groupId: string) => Promise<string[]>;
        getUsers: (groupId: string) => Promise<string[]>;
        delete: (groupId: string) => Promise<boolean>;
        list: (search?: string, limit?: number, offset?: number) => Promise<string[]>;
        add: (groupId: string) => Promise<boolean>;
    };
    shares: {
        delete: (shareId: string | number) => Promise<boolean>;
        edit: {
            permissions: (shareId: string | number, permissions: OcsSharePermissions) => Promise<import("./types").OcsShare>;
            password: (shareId: string | number, password: string) => Promise<import("./types").OcsShare>;
            publicUpload: (shareId: string | number, isPublicUpload: boolean) => Promise<import("./types").OcsShare>;
            expireDate: (shareId: string | number, expireDate: string) => Promise<import("./types").OcsShare>;
            note: (shareId: string | number, note: string) => Promise<import("./types").OcsShare>;
        };
        list: (path?: string, includeReshares?: boolean, showForSubFiles?: boolean) => Promise<import("./types").OcsShare[]>;
        add: (path: string, shareType: OcsShareType, shareWith?: string, permissions?: OcsSharePermissions, password?: string, publicUpload?: boolean) => Promise<import("./types").OcsShare>;
        get: (shareId: string | number) => Promise<import("./types").OcsShare>;
    };
    constructor(options: ConnectionOptions);
    as(username: string, password: string): NextcloudClient;
}
