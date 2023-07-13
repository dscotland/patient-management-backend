import { MailInput } from './inputs/MailInput';

export abstract class MailManagementRepository {
    abstract sendVerificationMail(
        mail: MailInput, verificationCode:string): Promise<boolean>;
    abstract sendForgotPassMail(
        mail: MailInput, forgotPasscode: string): Promise<boolean>;
}
