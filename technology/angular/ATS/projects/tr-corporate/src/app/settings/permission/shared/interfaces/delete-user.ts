export enum checStatus{
  isdeleted=1
}

export interface DeleteUser_request {
  emails: string[]
}
export interface DeleteUsers_request {
  emails: string[],
  isdeleted:checStatus.isdeleted;
  
}


export interface DeleteUser_response {
  error: boolean,
  statusCode: number,
  message: string,
}
