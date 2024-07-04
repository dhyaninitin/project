export interface GetUser_request {
  email: string
}

export interface GetUser_response {
  error: boolean,
  statusCode: number,
  message: string,
  data: {
    businessverticalid: string,
    designationname: string,
    email: string,
    firstname: string,
    lastname: string,
    locationname: string,
    middlename: string,
    mobilenumber: string,
    practicename: string,
    roletypeid: number,
    roletypename: string,
    status: number,
  }
}
