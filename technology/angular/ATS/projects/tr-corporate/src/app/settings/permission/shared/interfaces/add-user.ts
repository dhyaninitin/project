export interface AddUser_request {
  firstname: string,
  middlename: string,
  lastname: string,
  email: string,
  roletypeid: number,
  // accountroleid: string
}

export interface AddUser_response {
  error: boolean,
  statusCode: number,
  message: string,
  data: {
    firstname: string,
    middlename: string,
    lastname: string,
    roletypeid: number
  }
}
