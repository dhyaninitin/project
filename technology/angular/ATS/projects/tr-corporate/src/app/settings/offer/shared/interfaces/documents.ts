export interface ReviseDoc {
    documentname: string,
    size: string;
    extension: string;
    userInfo: {
        userid: number,
        imageUrl: string,
        email: string,
        picturename: string
    }
}

export interface DocumentI {
    offerdocumentid: string,
    documentname: string,
    documentoriginalname: string,
    documentpath: string,
    extension: string,
    size: string,
    userInfo: {
        userid: number,
        imageUrl: string,
        email: string,
        picturename: string
    }
}


export interface UserInfo_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: [
        {
            userid: number,
            imageUrl: string,
            email: string,
            picturename: string
        }
    ]
}

export interface Get_Document_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: [
        {
            offerdocumentid: string,
            documentname: string,
            documentoriginalname: string,
            documentpath: string,
            extension: string,
            size: string,
            userInfo: {
              userid: number,
              imageUrl: string,
              email: string,
              picturename: string
            }
        }
    ]
}

export interface Get_Revise_Document_Response {
    error: boolean,
    statusCode: number,
    message: string,
    data: 
     [
      {
        offerdocumentid: string,
        documentname: string,
        documentoriginalname: string,
        documentpath: string,
        extension: string,
        size: string,
        userInfo: {
          userid: number,
          imageUrl: string,
          email: string,
          picturename: string
      }
      }
     ]
  }