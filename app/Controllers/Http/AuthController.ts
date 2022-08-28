import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class AuthController {
  public async login({ request, response, auth }: HttpContextContract) {
    const email = request.input("email");
    const password = request.input("password");

    try {
      await auth.use("web").attempt(email, password);
      response.send({
        message: "User successfully logged in",
      });
    } catch (e) {
      console.log(e);
      return response.badRequest("Invalid credentials");
    }
  }
}
