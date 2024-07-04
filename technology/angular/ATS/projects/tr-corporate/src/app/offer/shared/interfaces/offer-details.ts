export interface IJobOfferDetails {    
    Department?: string,
    HiringManager?: number,
    code?: string,
    jobgradeid?: number | Boolean,
    joblevelid?: number | Boolean,
    joblocation?: string,
    jobnatureid?: number | string,
    jobstatus?: number | string,
    modifiedtime?: string,
    title?: string
}


export interface GeneralInfoI {
    jobid: number;
    status: number;
    candidateEmail: string;
    generalinfo : {
        offerLocation: string;
        offerDesignation: string;
        isRemote: number;
        dateOfJoining: string;
    }
}
  