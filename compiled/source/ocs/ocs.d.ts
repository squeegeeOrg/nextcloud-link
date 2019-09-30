import { OcsConnection } from './ocs-connection';
import { OcsActivity, OcsUser, OcsNewUser } from './types';
import { ConnectionOptions } from '../types';
export declare function configureOcsConnection(options: ConnectionOptions): void;
export declare function getActivities(connection: OcsConnection, fileId: number | string, sort?: 'asc' | 'desc', limit?: number, sinceActivityId?: number): Promise<OcsActivity[]>;
export declare function getUser(connection: OcsConnection, userId: string): Promise<OcsUser>;
export declare function listUsers(connection: OcsConnection): Promise<string[]>;
export declare function setUserEnabled(connection: OcsConnection): Promise<void>;
export declare function deleteUser(connection: OcsConnection, userId: string): Promise<boolean>;
export declare function addUser(connection: OcsConnection, user: OcsNewUser): Promise<boolean>;
export declare function editUser(connection: OcsConnection): Promise<void>;
export declare function getUserGroups(connection: OcsConnection): Promise<void>;
export declare function addUserToGroup(connection: OcsConnection): Promise<void>;
export declare function removeUserFromGroup(connection: OcsConnection): Promise<void>;
export declare function setUserSubAdmin(connection: OcsConnection): Promise<void>;
export declare function listGroups(connection: OcsConnection, search?: string, limit?: number, offset?: number): Promise<string[]>;
export declare function addGroup(connection: OcsConnection, groupId: string): Promise<boolean>;
export declare function deleteGroup(connection: OcsConnection, groupId: string): Promise<boolean>;
export declare function getGroupUsers(connection: OcsConnection, groupId: string): Promise<string[]>;
export declare function getGroupSubAdmins(connection: OcsConnection, groupId: string): Promise<string[]>;
