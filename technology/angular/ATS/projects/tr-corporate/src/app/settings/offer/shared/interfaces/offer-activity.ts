export interface Offer_Activity_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: [
        {
            offertemplateid: string;
            actiontext: string;
            activitytime: Date;
        }
    ]
  }