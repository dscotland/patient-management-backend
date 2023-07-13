import { AppointmentInput } from "../inputs/AppointmentInput";

export class Appointment {
  id:string
  doctor: string
  date: string
  description: string | undefined
  createdAt: string
  userId: string

  constructor(input: AppointmentInput) {
    const {
      id,
      doctor,
      date,
      description,
      createdAt,
      userId,
    } = input;

    this.id = id;
    this.doctor = doctor;
    this.date = date;
    this.description = description;
    this.createdAt = createdAt;
    this.userId = userId;
  }
}