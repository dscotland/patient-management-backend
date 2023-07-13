import { Appointment } from "./entities/Appointment";

export abstract class AppointmentManagementRepository {
    abstract create(appointment:Appointment): Promise<Appointment>;
    abstract list(userId:string): Promise<Appointment[]>;
}
