import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import User from "App/Models/User";
import Route from "@ioc:Adonis/Core/Route";
import Mail from "@ioc:Adonis/Addons/Mail";
import Env from "@ioc:Adonis/Core/Env";
import UserRegistrationSchema from "App/Schemas/UserRegistrationSchema";

export default class AuthController {
  public async login({ request, response, auth }: HttpContextContract) {
    const { email, password } = await request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [rules.email()]),
        password: schema.string(),
      }),
    });

    try {
      await auth.use("web").attempt(email, password);
      response.send({
        message: "User successfully logged in",
      });
    } catch {
      response.badRequest("Invalid credentials");
    }
  }

  public async register({ request }: HttpContextContract) {
    const payload = await request.validate({ schema: UserRegistrationSchema });
    const user = await User.create(payload);

    //generate a signed url for the user to verify their email
    const verifyEmailUrl = Route.makeSignedUrl(
      "verifyEmail",
      {
        userId: user.id,
      },
      {
        prefixUrl: Env.get("APP_URL"),
        expiresIn: "1 day",
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

    return {
      message: "User created successfully",
    };
  }

  public async verifyEmail({ request, response, params }: HttpContextContract) {
    if (!request.hasValidSignature()) {
      return response.badRequest("Invalid signature");
    }
    const user = await User.findOrFail(params.userId);

    if (user.isEmailVerified) {
      return response.badRequest("Email already verified");
    }
    return user.merge({ isEmailVerified: true }).save();
  }
}
