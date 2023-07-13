import { MailManagementRepository } from '../domain/repository';
import { MailInput } from '../domain/inputs/MailInput';
import { AWSService } from '../../layers/awsService/nodejs/awsUtilities';
import { SESTemplateEmailInput } from '../../layers/awsService/nodejs/SESTemplateEmailInput';


export class ConcreteMailManagementRepository extends MailManagementRepository {

    awsService = new AWSService();

    /**
     *
     * @param { string } verificationCode the verification code
     * to be used in creating the url
     *
     * @param { string } username the username to be used in creating the url
     * 
     * @param { string } clientId the clientId of the userpool
     *
     * @returns { String } the user specific registration url
     */
     makeVerificationUrl(email:string):string {
        let environment;
        if(process.env.STAGE === 'DEV') {
            environment = `https://main.d1gwte5k7vxu9w.amplifyapp.com/verify?email=${encodeURIComponent(email)}`
        } else if (process.env.STAGE === 'QA') {
            environment = `https://main.d1gwte5k7vxu9w.amplifyapp.com/verify?email=${encodeURIComponent(email)}`
        } else if (process.env.STAGE === 'PROD') {
            environment = `https://main.d1gwte5k7vxu9w.amplifyapp.com/verify?email=${encodeURIComponent(email)}`
        }
        const link = `${environment}`;
        return link;
    }

    async sendVerificationMail(mail:MailInput, verificationCode:string):
    Promise<boolean> {
        let err: Error | null = null;
        const descryptedCode = await this.awsService.decryptCode(verificationCode);
        const emailInput: SESTemplateEmailInput = {
            Destination: {
                ToAddresses: [mail.to]
            },
            Source: `"PM" <${mail.from}>`,
            Template: 'WelcomeEmail',
            TemplateData: {
                code: descryptedCode,
                name: mail.name,
                link: this.makeVerificationUrl(mail.to)
            }
        }
        const emailResult = await this.awsService.sendSESTemplateEmail(emailInput);
        console.log(emailResult);
        return new Promise((resolve, reject) => {
            if(err === null) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    }

    async sendForgotPassMail(mail:MailInput, verificationCode:string):
    Promise<boolean> {
        let err: Error | null = null;
        const descryptedCode = await this.awsService.decryptCode(verificationCode);
        const emailInput: SESTemplateEmailInput = {
            Destination: {
                ToAddresses: [mail.to]
            },
            Source: `"nCight" <${mail.from}>`,
            Template: 'ForgotPasswordEmail',
            TemplateData: {
                code: descryptedCode,
                name: mail.name,
            }
        }
        const emailResult = await this.awsService.sendSESTemplateEmail(emailInput);
        console.log(emailResult);
        return new Promise((resolve, reject) => {
            if(err === null) {
                resolve(true);
            } else {
                reject(err);
            }
        });
    }



}