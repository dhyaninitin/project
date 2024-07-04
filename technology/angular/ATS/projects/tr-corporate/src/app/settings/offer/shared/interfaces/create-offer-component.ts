export interface ComponentPayload {
  offercomponentid: string;
  fieldname: string;
  componenttype: string;
  hideifzero: number;
  ruleadded: number;
  selectedcomponent: string;
  mathfunction: string;
  operator: string;
  rule: string;
  codeEditor: number;
  offertemplateid: string;
  createdtime: Date;
  modifiedtime: Date;
}

export interface OfferComponentVLookUpPayload {
  offertemplateid: string;
  exceldata: [];
}


export interface Offer_VLookUp_Response {
  error: boolean,
    statusCode: number,
    message: string,
    data: [
        {
            offertemplateid: string;
            exceldata: [];
        }
    ]
}
