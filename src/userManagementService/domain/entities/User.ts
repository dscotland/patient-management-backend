import { UserInput } from "../inputs/UserInput";
export class User {
  id:string
  givenName: string
  familyName: string
  dateOfBirth: string | undefined
  createdAt: string
  deletedAt: string | undefined
  status: UserStatus
  email: string
  type: UserType
  phoneNumber: string | undefined
  ipAddress: string

  constructor(input: UserInput) {
    const {
      id,
      givenName,
      familyName,
      dateOfBirth,
      createdAt,
      deletedAt,
      status,
      email,
      type,
      phoneNumber,
      ipAddress
    } = input;

    this.id = id;
    this.givenName = givenName;
    this.familyName = familyName;
    this.dateOfBirth = dateOfBirth;
    this.createdAt = createdAt;
    this.deletedAt = deletedAt;
    this.status = status;
    this.email = email;
    this.type = type;
    this.phoneNumber = phoneNumber;
    this.ipAddress = ipAddress;
  }
}

export enum UserStatus {
    ACCEPTED = 'Accepted',
    PENDING = 'Pending'
}

export enum UserType {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
}