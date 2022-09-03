import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import User from "App/Models/User";
import UnVerifiedException from "App/Exceptions/UnVerifiedException";

type UserVerifiedHandler = Pick<HttpContextContract, "bouncer"> & {
  user: User;
};
export default class UserVerified {
  public static async handle({ bouncer, user }: UserVerifiedHandler) {
    if (await bouncer.forUser(user).with("UserPolicy").denies("verified")) {
      throw new UnVerifiedException(user);
    }
  }

  public async handle(
    { bouncer, auth }: HttpContextContract,
    next: () => Promise<void>
  ) {
    await UserVerified.handle({ bouncer, user: auth.user! });
    await next();
  }
}
