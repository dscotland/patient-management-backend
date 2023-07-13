import { User } from '../../entities/User';
import { UserManagementRepository } from '../../repository';

export class UpdateUser {
    repository: UserManagementRepository;

    /**
     *
     * @param { UserManagementRepository } repository repo to be used
     * to execute the use case.
     */
    constructor(repository: UserManagementRepository) {
        this.repository = repository;
    }

    /**
     * @param { User } user The User Entity
     * @returns { Promise<User> }
     */
    async execute(user: User): Promise<User> {
        const operation = await this.repository.updateUser(user);
        return new Promise((resolve, reject) => {
            if (operation) {
                resolve(operation);
            } else {
                reject(operation);
            }
        });
    }
}
