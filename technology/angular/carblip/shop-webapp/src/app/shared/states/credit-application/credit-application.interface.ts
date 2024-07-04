export interface ICreditApplicaitonObj {
  readonly firstName: string;
  readonly mi: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly emailAddress: string;
  readonly dateOfBirth: string;
  readonly residenceType: number;
  readonly mortage: string;
  readonly streetAddress: string;
  readonly apt: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly employerName: string;
  readonly employerAddress: string;
  readonly employerPhone: string;
  readonly securityNumber: string;
  readonly confirmSecurityNumber: string;
  readonly driverLicenseState: string;
  readonly driverLicenseNumber: string;
  readonly grossIncome: string;
}
export interface ICreditApplicaiton {
  readonly wayOfApplying: number;
  readonly primary: ICreditApplicaitonObj;
  readonly co: ICreditApplicaitonObj;
}
