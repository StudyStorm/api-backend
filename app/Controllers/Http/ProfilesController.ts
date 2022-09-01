import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class ProfilesController {
  public async index({ auth }: HttpContextContract) {
    return auth.user;
  }
}
