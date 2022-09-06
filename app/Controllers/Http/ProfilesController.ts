import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ProfilesUpdateSchema from "App/Schemas/ProfilesUpdateSchema";
import User from "App/Models/User";
import Drive from "@ioc:Adonis/Core/Drive";
import axios from "axios";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import { EmailChangeToken } from "App/core/UserToken";
import Env from "@ioc:Adonis/Core/Env";
import Mail from "@ioc:Adonis/Addons/Mail";

export default class ProfilesController {
  public async index({ auth }: HttpContextContract) {
    return auth.user;
  }

  public async update({ auth, request }: HttpContextContract) {
    const { profilePicture, ...payload } = await request.validate({
      schema: ProfilesUpdateSchema,
    });
    const user = await User.findOrFail(auth.user!.id);

    if (profilePicture) {
      User.uploadProfilePicture(user, profilePicture).catch(console.error);
    }

    return user.merge(payload).save();
  }

  public async destroy({ auth, response }: HttpContextContract) {
    const user = await User.findOrFail(auth.user!.id);
    await user.delete();
    return response.ok({ message: "Account deleted successfully" });
  }

  public async profilePicture({ params, response }: HttpContextContract) {
    const user = await User.findOrFail(params.id);
    if (user.profilePicture) {
      const stream = await Drive.getStream(user.profilePicture);
      return response
        .header("content-type", "image/png")
        .header("cache-control", "public, max-age=3600;")
        .send(stream);
    } else {
      const defaultUrl = `https://avatars.dicebear.com/api/bottts/${user.id}.svg?scale=75`;
      const { data } = await axios.get(defaultUrl, { responseType: "stream" });
      return response
        .header("content-type", "image/svg+xml")
        .header("cache-control", "public, max-age=3600;")
        .stream(data);
    }
  }

  public async askResetEmail({ auth, request, response }: HttpContextContract) {
    const { email } = await request.validate({
      schema: schema.create({
        email: schema.string({ trim: true }, [
          rules.email(),
          rules.unique({ table: "users", column: "email" }),
        ]),
      }),
    });
    const user = auth.user!;
    const key = EmailChangeToken.createToken(user, email);
    const resetEmailUrl = new URL("/verify-email", Env.get("CLIENT_URL"));
    resetEmailUrl.searchParams.set("key", key);

    await Mail.sendLater((message) => {
      message
        .from("no_reply@studystorm.net", "StudyStorm Inc.")
        .subject("Change your email")
        .to(email)
        .htmlView("emails/changeEmail", {
          user,
          url: resetEmailUrl.toString(),
        });
    });

    return response.ok({ message: "Email sent" });
  }
}
