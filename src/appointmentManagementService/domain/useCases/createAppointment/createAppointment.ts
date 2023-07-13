import { Appointment } from '../../entities/Appointment';
import { AppointmentManagementRepository } from '../../repository';

export class CreateAppointment {
    repository: AppointmentManagementRepository;

    /**
     *
     * @param { AppointmentManagementRepository } repository repo to be used
     * to execute the use case.
     */
    constructor(repository: AppointmentManagementRepository) {
        this.repository = repository;
    }

    /**
     * @param { Appointment } appointment The Appointment Entity
     * @returns { Promise<Appointment> }
     */
    async execute(appointment: Appointment): Promise<Appointment> {
        const operation = await this.repository.create(appointment);
        return new Promise((resolve, reject) => {
            if (operation) {
                resolve(operation);
            } else {
                reject(operation);
            }
        });
    }
}
