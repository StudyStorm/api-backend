import { BaseCommand } from "@adonisjs/core/build/standalone";
import { validator } from "@ioc:Adonis/Core/Validator";
import UserRegistrationSchema from "App/Schemas/UserRegistrationSchema";

export default class CreateUser extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "create:user";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Create a new user";

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  };

  public async run() {
    const { default: User } = await import("App/Models/User");
    try {
      const payload = await validator.validate({
        schema: UserRegistrationSchema,
        data: {
          email: await this.prompt.ask("Enter email"),
          password: await this.prompt.secure("Enter password"),
          firstName: await this.prompt.ask("Enter first name"),
          lastName: await this.prompt.ask("Enter last name"),
        },
      });
      const superAdmin = await this.prompt.confirm("Create super admin?");
      const user = await User.create({
        ...payload,
        isEmailVerified: true,
        isSuperAdmin: superAdmin,
      });
      this.logger.info(`User created with id ${user.id}`);
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
