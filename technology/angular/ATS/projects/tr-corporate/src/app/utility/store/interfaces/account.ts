export interface Iaccount {
    accountList: IaccountList[],
    details: IaccountDetials
}

export interface IaccountList {
    accountid: string;
    name: string;
}

export interface IaccountDetials {
    accounttype: string;
    cityid: string;
    cityname: string;
    countryid: string;
    countryname: string;
    domain: string;
    industryid: string;
    industryname: string;
    name: string;
    shortname: string;
    stateid: string;
    statename: string;
}