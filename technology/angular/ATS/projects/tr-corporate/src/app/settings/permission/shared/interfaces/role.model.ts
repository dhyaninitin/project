export interface Irole {
    accountroleid: string;
    isdefaultrole: number; // 1 -dafault, 0 - custom
    roletypeid: number;
    name: string;
    rolename: string;
    usercount: number;
    modifiedDatetime: Date | string;
}