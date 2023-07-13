import { Handler } from "aws-cdk-lib/aws-lambda";
import { ConcreteUserManagementRepoaitory } from "../concreteUserManagementRepository";
import { RegisterUser } from "../../domain/useCases/registerUser/registerUser";
import { User, UserType, UserStatus } from "../../domain/entities/User";
import { UserInput } from "../../domain/inputs/UserInput";
import { UtilitiesService } from "../../../layers/utilitiesService/nodejs/generalUtilities";


const utilitiesService = new UtilitiesService();

export const handler: Handler = async (event:Record<string,any>,context:unknown) => {
  console.log(event);
  console.log(context);
  let jsonResponse:unknown = {};
  let status:number = 200;
  const triggerSource = event.triggerSource;
  const id = event.request.userAttributes['custom:userId'];
  const ipAddress = event.request.userAttributes['custom:ipAddress'];
  const phoneNumber = event.request.userAttributes.phone_number;
  const firstName = event.request.userAttributes.given_name;
  const lastName = event.request.userAttributes.family_name;
  const dateOfBirth = event.request.userAttributes.date_of_birth;
  const email = event.request.userAttributes.email;

if(triggerSource === "PostConfirmation_ConfirmSignUp"){
  const userInput:UserInput = {
    id:id,
    createdAt: utilitiesService.getCurrentDateTime(),
    familyName: lastName,
    givenName: firstName,
    dateOfBirth: dateOfBirth,
    email:email,
    status: UserStatus.ACCEPTED,
    type: UserType.PATIENT,
    phoneNumber: phoneNumber,
    ipAddress: ipAddress
  };

  const user = new User(userInput);
  console.log("THE USER:")
  console.log(user);
  try{
    const repo = new ConcreteUserManagementRepoaitory();
    const action = new RegisterUser(repo);
    const response = await action.execute(user);

    jsonResponse = {
        id: response.id,
        createdAt: response.createdAt,
        familyName: response.familyName,
        givenName: response.givenName,
        email: response.email,
        status: response.status
    };

    console.log("THE JSON RESPONSE:");
    console.log(jsonResponse);
  } catch (error){
    const internalServerError = 500;
    jsonResponse={error:error};
    status = internalServerError;
    console.log(error);
  }
}
  return event;
};
