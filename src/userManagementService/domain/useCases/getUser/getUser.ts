import { User } from '../../entities/User';
import { UserManagementRepository } from '../../repository';

export class GetUser {
  repository: UserManagementRepository;
  /**
   *
   * @param {UserManagementRepository} repository the repo to be used
   * to execute the use case.
   */
  constructor(repository: UserManagementRepository) {
      this.repository = repository;
  }

  /**
   *
   * @param {string} userId the userId string
   * @returns {Promise<UserInfo>}
   */
  async execute(userId: string): Promise<User> {
      const operation = await this.repository.getUser(userId);
      return new Promise((resolve, reject) => {
          if (operation) {
              resolve(operation);
          } else {
              reject(operation);
          }
      });
  }
}
