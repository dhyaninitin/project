export interface AccountList_response {
  error: boolean,
  statuscode: number,
  message: string,
  data: [
    {
      accountid: string,
      name: string
    }
  ]
}
