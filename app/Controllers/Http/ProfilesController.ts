import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import ProfilesUpdateSchema from "App/Schemas/ProfilesUpdateSchema";
import User from "App/Models/User";

export default class ProfilesController {
  public async index({ auth }: HttpContextContract) {
    return auth.user;
  }

  public async update({ auth, request }: HttpContextContract) {
    const user = await User.findOrFail(auth.user!.id);

    const payload = await request.validate({
      schema: ProfilesUpdateSchema,
    });

    return await user.merge(payload).save();
  }

  public async destroy({ auth, response }: HttpContextContract) {
    const user = await User.findOrFail(auth.user!.id);
    await user.delete();
    return response.ok({ message: "Account deleted successfully" });
  }
}
