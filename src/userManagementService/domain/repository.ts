import { User } from "./entities/User";

export abstract class UserManagementRepository {
    abstract register(user:User): Promise<User>;
    abstract getUser(userId:string): Promise<User>;
    abstract updateUser(user:User): Promise<User>;
    abstract deleteUser(userId:string): Promise<User>;
}
