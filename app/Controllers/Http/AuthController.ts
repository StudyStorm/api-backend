import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import User from "App/Models/User";

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
    const registerSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.unique({ table: "users", column: "email" }),
      ]),
      password: schema.string([rules.minLength(6)]),
      firstName: schema.string({ trim: true }, [rules.capitalize()]),
      lastName: schema.string({ trim: true }, [rules.capitalize()]),
    });

    const payload = await request.validate({ schema: registerSchema });
    const user = await User.create(payload);
    //todo send email verification
    return user.refresh();
  }
}
