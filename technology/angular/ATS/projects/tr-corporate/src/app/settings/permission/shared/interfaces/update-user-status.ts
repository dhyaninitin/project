export enum userStatus{
  deactivate,   //0
  activate,
}

export interface UpdateUsersStatus_request {
  status:number,
  emails: string[]
}

export interface UpdateUserStatus_request {
  status: number,
  emails: string[]
}

export interface UpdateUserStatus_response {
  error: boolean,
  statusCode: number,
  message: string,
}
