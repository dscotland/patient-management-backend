import { UserStatus, UserType } from '../entities/User'

export interface UserInput{
    id: string
    givenName: string
    familyName: string
    dateOfBirth: string
    deletedAt?: string
    createdAt: string
    status: UserStatus
    email: string
    type: UserType
    phoneNumber?: string
    ipAddress: string
}