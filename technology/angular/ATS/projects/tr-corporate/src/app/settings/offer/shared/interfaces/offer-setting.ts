export interface Offer_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: []
}

export interface Offer_Insert_Response {
  error: boolean,
  statusCode: number,
  message: string,
  data: {
    acknowledged: boolean,
    insertedId: {}
  }
}

export interface Offer_Document_Response {
  error: boolean,
  statusCode: number,
  message: string,
  data: {
    url: string,
    bucketPath: string,
    fileType: string,
    fileName: string
  }
}

export interface Offer_Update_Response {
  error: boolean,
  statusCode: number,
  message: string,
  data: {
    acknowledged: boolean,
    matchedCount: number,
    modifiedCount: number,
    upsertedCount: number
    upsertedId: null
  }
}

export interface Offer_Delete_Response {
  error: boolean,
  statusCode: number,
  message: string,
  data: {
    acknowledged: boolean,
    deletedCount: number
  }
}

export interface Offer_Count {
    error: boolean,
    statusCode: number,
    message: string,
    data: [
      {
        _id: null,
        count: 0
      }
    ]
}

export interface Offer_Component_Response {
  error: boolean,
  statusCode: number,
  message: string,
  data: [
    {
      offercomponentid: string,
      fieldname: string,
      componenttype: string,
      hideifzero: number,
      ruleadded: number,
      codeEditor: number,
      selectedcomponent: string,
      mathfunction: string,
      operator: string,
      rule: string,
      offertemplateid: string,
      createdtime: Date,
      modifiedtime: Date
    }
  ]
}

export interface Update_response {
  error: boolean,
  statusCode: number,
  message: string,
  data: [
    {
    }
  ]
}


export interface UploadToS3 {
  path: string;
  responseContentType: string;
  fileName: string;
}