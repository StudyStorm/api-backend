import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import User from "App/Models/User";
import Mail from "@ioc:Adonis/Addons/Mail";
import Env from "@ioc:Adonis/Core/Env";
import UserRegistrationSchema from "App/Schemas/UserRegistrationSchema";
import Encryption from "@ioc:Adonis/Core/Encryption";
import { AuthorizationException } from "@adonisjs/bouncer/build/src/Exceptions/AuthorizationException";
import UserVerified from "App/Middleware/UserVerified";

export default class AuthController {
  public async login({
    request,
    response,
    auth,
    bouncer,
  }: HttpContextContract) {
    const { email, password } = await request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        password: schema.string(),
      }),
    });
    const user = await auth.use("web").verifyCredentials(email, password);
    await UserVerified.handle({ bouncer: bouncer, user });
    await auth.use("web").login(user);
    response.ok({ message: "User successfully logged in" });
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use("web").logout();
    return response.ok({ message: "User successfully logged out" });
  }

  private async sendVerifyEmail(user: User) {
    const key = Encryption.encrypt(user.id, "24 hours", "verifyEmail");

    const verifyEmailUrl = new URL("/verify", Env.get("CLIENT_URL"));
    verifyEmailUrl.searchParams.set("key", key);

    await Mail.sendLater((message) => {
      message
        .from("no_reply@studystorm.net", "StudyStorm Inc.")
        .subject("Verify your email")
        .to(user.email)
        .htmlView("emails/verify", {
          user,
          url: verifyEmailUrl.toString(),
        });
    });
  }

  public async register({ request, response }: HttpContextContract) {
    const { profilePicture, ...payload } = await request.validate({
      schema: UserRegistrationSchema,
    });
    const user = await User.create(payload);
    if (profilePicture) {
      User.uploadProfilePicture(user, profilePicture).catch(console.error);
    }
    await this.sendVerifyEmail(user);
    return response.created({
      message: "User created",
      resendToken: Encryption.encrypt(user.id, "1 hour", "resendToken"),
    });
  }

  public async verifyEmail({ request, response }: HttpContextContract) {
    const userId = Encryption.decrypt(request.input("key", ""), "verifyEmail");
    if (!userId) {
      return response.badRequest({ message: "Invalid key" });
    }
    const user = await User.findOrFail(userId);

    if (user.isEmailVerified) {
      return response.badRequest({ message: "Email already verified" });
    }
    await user.merge({ isEmailVerified: true }).save();
    return response.ok({ message: "Email verified" });
  }

  public async resendVerifyEmail({ request, response }: HttpContextContract) {
    const userId = Encryption.decrypt<string>(
      request.input("key", ""),
      "resendToken"
    );
    if (!userId) {
      return response.badRequest({ message: "Invalid key" });
    }
    const user = await User.findOrFail(userId);
    await this.sendVerifyEmail(user);
    return response.ok({ message: "Email sent" });
  }

  public async forgotPassword({
    request,
    response,
    bouncer,
  }: HttpContextContract) {
    const { email } = await request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
      }),
    });

    const user = await User.findBy("email", email);
    if (
      !user ||
      (await bouncer.forUser(user).with("UserPolicy").denies("verified"))
    ) {
      // to avoid spoofing of the email
      return response.ok({ message: "Email sent" });
    }
    //if user change password the key becomes invalid
    const key = Encryption.encrypt([user.id, user.password], "24 hours");

    const resetPasswordUrl = new URL("/reset-password", Env.get("CLIENT_URL"));
    resetPasswordUrl.searchParams.set("key", key);

    await Mail.sendLater((message) => {
      message
        .from("no_reply@studystorm.net", "StudyStorm Inc.")
        .subject("Reset your password")
        .to(user.email)
        .htmlView("emails/resetPassword", {
          user,
          url: resetPasswordUrl.toString(),
        });
    });

    return response.ok({ message: "Email sent" });
  }

  private async getUserFromToken({
    request,
    bouncer,
  }: HttpContextContract): Promise<User> {
    const decrypted = Encryption.decrypt<[string, string]>(
      request.input("key", "")
    );
    if (!decrypted) {
      throw new AuthorizationException("Invalid key", 401);
    }
    const [userId, password] = decrypted;
    const user = await User.findOrFail(userId);
    if (user.password !== password) {
      throw new AuthorizationException("Invalid key", 401);
    }
    await bouncer.forUser(user).with("UserPolicy").authorize("verified");
    return user;
  }

  public async resetPasswordInfo(ctx: HttpContextContract) {
    const user = await this.getUserFromToken(ctx);
    return ctx.response.ok(
      user.serialize({
        fields: ["email"],
      })
    );
  }

  public async resetPassword(ctx: HttpContextContract) {
    const user = await this.getUserFromToken(ctx);
    const { password } = await ctx.request.validate({
      schema: schema.create({
        password: schema.string(),
      }),
    });
    await user.merge({ password }).save();

    return ctx.response.ok({ message: "Password successfully reset" });
  }
}
