import { Exception } from "@adonisjs/core/build/standalone";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import { ResendToken } from "App/core/UserToken";

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new UnVerifiedException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class UnVerifiedException extends Exception {
  constructor(public user: User) {
    super("User is not verified", 403);
  }
  public async handle(error: this, { response }: HttpContextContract) {
    return response.forbidden({
      message: error.message,
      resendToken: ResendToken.createToken(error.user),
    });
  }
}
