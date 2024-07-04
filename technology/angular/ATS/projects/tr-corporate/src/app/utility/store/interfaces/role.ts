
export interface Irole {
    name: string;
    roletypeid: string;
    isdefaultrole: number;
    accountroleid:string;
}

export interface Iroles {
    list: Irole[]
}