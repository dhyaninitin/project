export interface Get_CustomFields_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: [
        {
            fieldname: string;
            offertemplateid: [];
            fieldtype: string;
            parentid: string;
            helptext: string;
            ismandatory: number;
            isactive: number;
            configuration: {};
            customfieldid: string;
            createdtime: Date;
            modifiedtime: Date;
        }
    ]
}

export interface Post_CustomFields {
    error: boolean,
    statusCode: number,
    message: string,
    data: [
        {
           offertemplateid: [],
           fieldname: string,
           fieldtype: string,
           templatefor:string,
           parentid: number,
           helptext: string,
           ismandatory: number,
           isactive: number,
           configuration: {}
        }
    ]
}

export interface Custom_Field_Delete_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: {
      acknowledged: boolean,
      deletedCount: number
    }
  }

  export interface Put_CustomFields {
    error: boolean,
    statusCode: number,
    message: string,
    data: [
        {
           customfieldid:string,
           offertemplateid: [],
           fieldname: string,
           fieldtype: string,
           parentid: number,
           ismandatory: number,
           isactive: number,
        }
    ]
}

export interface Document_Delete_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: {
      acknowledged: boolean,
      deletedCount: number
    }
}