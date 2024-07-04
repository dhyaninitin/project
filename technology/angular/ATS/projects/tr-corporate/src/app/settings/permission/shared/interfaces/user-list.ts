export interface UserList_response {

  error: boolean,
  statusCode: number,
  message: string,
  data: {
    userslist: [
      {
        fullname: string,
        role: string,
        email: string,
        Status: number,
        last_updated: string
      }
    ],
    totalcount: number
  }

}
