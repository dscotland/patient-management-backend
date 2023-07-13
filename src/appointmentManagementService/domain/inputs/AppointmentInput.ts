export interface AppointmentInput{
    id: string
    doctor : string,
    date: string,
    description?: string
    createdAt: string,
    userId: string,
}