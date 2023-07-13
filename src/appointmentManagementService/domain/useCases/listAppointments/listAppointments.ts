import { Appointment } from '../../entities/Appointment';
import { AppointmentManagementRepository } from '../../repository';

export class ListAppointments {
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
     * @param { string } userId The userId to for the user whose appointments we'll be listing
     * @returns { Promise<Appointment[]> }
     */
    async execute(userId: string): Promise<Appointment[]> {
        const operation = await this.repository.list(userId);
        return new Promise((resolve, reject) => {
            if (operation) {
                resolve(operation);
            } else {
                reject(operation);
            }
        });
    }
}
