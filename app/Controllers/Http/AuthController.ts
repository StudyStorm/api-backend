import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import User from "App/Models/User";
import Route from "@ioc:Adonis/Core/Route";
import Mail from "@ioc:Adonis/Addons/Mail";
import Env from "@ioc:Adonis/Core/Env";
import UserRegistrationSchema from "App/Schemas/UserRegistrationSchema";
import Encryption from "@ioc:Adonis/Core/Encryption";

export default class AuthController {
  public async login({ request, response, auth }: HttpContextContract) {
    const { email, password } = await request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        password: schema.string(),
      }),
    });
    await auth
      .use("web")
      .attempt(email, password)
      .then(() => response.ok({ message: "User successfully logged in" }))
      .catch(() => response.unauthorized({ message: "Invalid credentials" }));
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use("web").logout();
    return response.ok({ message: "User successfully logged out" });
  }

  public async register({ request, response }: HttpContextContract) {
    const payload = await request.validate({ schema: UserRegistrationSchema });
    const user = await User.create(payload);

    const key = Encryption.encrypt(user.id, "24 hours");

    const verifyEmailUrl = Route.makeUrl(
      "verifyEmail",
      {},
      {
        qs: { key },
        prefixUrl: Env.get("APP_URL"),
      }
    );

    await Mail.sendLater((message) => {
      message
        .from("no_reply@studystorm.net", "StudyStorm Inc.")
        .subject("Verify your email")
        .to(user.email)
        .htmlView("emails/verify", {
          user,
          url: verifyEmailUrl,
        });
    });

    return response.created({ message: "User created" });
  }

  public async verifyEmail({ request, response }: HttpContextContract) {
    const userId = Encryption.decrypt(request.input("key", ""));
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
    if (!user || (await bouncer.forUser(user).with("UserPolicy").denies("verified"))) {
      // to avoid spoofing of the email
      return response.ok({ message: "Email sent" });
    }

    const key = Encryption.encrypt(user.id, "24 hours");

    const resetPasswordUrl = Route.makeUrl("resetPassword", {
      qs: { key },
      prefixUrl: Env.get("APP_URL"),
    });

    await Mail.sendLater((message) => {
      message
        .from("no_reply@studystorm.net", "StudyStorm Inc.")
        .subject("Reset your password")
        .to(user.email)
        .htmlView("emails/resetPassword", {
          user,
          url: resetPasswordUrl,
        });
    });

    return response.ok({ message: "Email sent" });
  }

  public async resetPasswordInfo({
    request,
    response,
    bouncer,
  }: HttpContextContract) {
    const userId = Encryption.decrypt(request.input("key", ""));
    if (!userId) {
      return response.badRequest({ message: "Invalid key" });
    }
    const user = await User.findOrFail(userId);
    await bouncer.forUser(user).with("UserPolicy").authorize("verified");
    return response.ok(
      user.serialize({
        fields: ["email"],
      })
    );
  }

  public async resetPassword({
    request,
    response,
    bouncer,
  }: HttpContextContract) {
    const userId = Encryption.decrypt(request.input("key", ""));
    if (!userId) {
      return response.badRequest({ message: "Invalid key" });
    }

    const { password } = await request.validate({
      schema: schema.create({
        password: schema.string(),
      }),
    });
    const user = await User.findOrFail(userId);
    await bouncer.forUser(user).with("UserPolicy").authorize("verified");

    await user.merge({ password }).save();

    return response.ok({ message: "Password successfully reset" });
  }
}
