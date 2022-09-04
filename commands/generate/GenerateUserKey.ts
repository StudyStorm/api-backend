import { BaseCommand } from "@adonisjs/core/build/standalone";
import {
  PasswordResetToken,
  ResendToken,
  TokenGenerator,
  VerifyToken,
} from "App/core/UserToken";

export default class CreateUser extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = "generate:user-key";

  /**
   * Command description is displayed in the "help" output
   */
  public static description = "Generate a user key";

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
    const email = await this.prompt.ask("Enter user email");
    const user = await User.findByOrFail("email", email);
    const tokenGenerators: Record<string, TokenGenerator> = {
      PasswordResetToken,
      ResendToken,
      VerifyToken,
    };
    const generator = await this.prompt.choice<string, TokenGenerator>(
      "Select key type",
      Object.keys(tokenGenerators),
      {
        result: (generatorName) => tokenGenerators[generatorName],
      }
    );
    this.logger.info(generator.createToken(user));
  }
}
