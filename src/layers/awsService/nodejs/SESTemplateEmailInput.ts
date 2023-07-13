export interface SESTemplateEmailInput {

    Destination: SESEmailTemplateDestination,
    Source: string, /* The email address that is sending the email */
    Template: string, /* The template to use when sending this email */
    TemplateData: any, /* A list of replacement values to apply to the template. 
                           This parameter is a JSON object, typically consisting of 
                           key-value pairs in which the keys correspond to replacement 
                           tags in the email template. */
}

interface SESEmailTemplateDestination {
    BccAddresses?: string[], // The recipients to place on the BCC: line of the message.
    CcAddresses?: string[], // The recipients to place on the CC: line of the message.
    ToAddresses: string[] // The recipients to place on the To: line of the message.
}
