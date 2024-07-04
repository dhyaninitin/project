export interface Iuser {
    isLoggedIn: boolean;
    fullName: string;
    name: { firstName: string, middleName: string, lastName: string },
    mobileNumber: string;
    email: string;
    address: string;
    city: Icity;
    downloadPreSignedURI:string,
    country: Icountry;
    state: Istate;
    role: Irole;
    practicename: string;
    profileimagepath: string;
    picturename: string;
    locationname: string;
    designationname: string;
    businessverticalid: string;
    status: number
}

interface Icity {
    cityId: string;
    cityName: string;
}
interface Istate {
    stateId: string;
    stateName: string;
}
interface Icountry {
    countryId: string;
    countryName: string;
}
interface Irole {
    roletypeid: number;
    roletypename: string;
}