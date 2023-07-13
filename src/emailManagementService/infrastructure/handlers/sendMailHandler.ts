/* eslint-disable max-len */
import { MailInput } from "../../domain/inputs/MailInput";
import { ConcreteMailManagementRepository } from '../concreteMailManagementRepository';

/**
 *
 * @param { any } event event to use.
 */
export async function handler(
    event: Record<string, Record<string, any>>): Promise<Record<string, unknown>> {
    const eventSource = event.triggerSource;
    const repo = new ConcreteMailManagementRepository();
    const email = event.request.userAttributes.email;
    const name = event.request.userAttributes.given_name;

    const mail:MailInput = {
        to: email,
        from: process.env.SOURCE_EMAIL || '',
        name: name
    };

    try {
        if(eventSource.toString() === 'CustomEmailSender_SignUp') {
            if(typeof event.request.code == 'string') {
                const verificationCode:any = event.request.code;
                await repo.sendVerificationMail(mail, verificationCode);
            }
        }
        if(eventSource.toString() === 'CustomEmailSender_ForgotPassword') {
            if(typeof event.request.code == 'string') {
                const forgotPasscode:any = event.request.code;
                await repo.sendForgotPassMail(mail, forgotPasscode);
            }
        }
        if(eventSource.toString() === 'CustomEmailSender_ResendCode') {
            if(typeof event.request.code == 'string') {
                const verificationCode:any = event.request.code;
                await repo.sendVerificationMail(mail, verificationCode);
            }
        }
    } catch (error) {
        console.log(error);
    }

    return event;
}
