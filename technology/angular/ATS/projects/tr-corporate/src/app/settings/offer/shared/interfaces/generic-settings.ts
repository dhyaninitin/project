export interface Generic_Settings_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: {
        jobtype : [],
        jobcode : string,
        offersalaryconvention : string,
        displayvaluesin : string,
        internalapproval : string,
        isofferrelaseenable : number ,
        offerrelase : [],
        allowtoaddcc : number,
        allowedccmails: [],
        offervalidity : string,
        createdtime : Date,
        modifiedtime : Date
      }
  }