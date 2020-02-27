import { AxiosInstance } from 'axios';
import { Tag } from './tag';
import { FileProps } from './fileProps';
export declare class PropertiesClient {
    private readonly baseURL;
    private readonly username;
    readonly connection: AxiosInstance;
    constructor(baseURL: string, username: string, password: string);
    getUserFilePath: (path: string) => string;
    getFileId: (path: string) => Promise<string>;
    addTag: (fileId: string | number, tag: Tag) => Promise<void>;
    removeTag: (fileId: string | number, tag: Tag) => Promise<void>;
    getTags: (fileId: string | number) => Promise<Tag[]>;
    getFileProps: (path: string, names?: string[]) => Promise<FileProps>;
    saveProps: (fileProps: FileProps) => Promise<void>;
    private callPropFind;
    createTag: (name: string) => Promise<Tag>;
    private parseIdFromLocation;
    private parseMultiStatus;
}