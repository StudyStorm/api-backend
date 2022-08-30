import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { UserFactory } from "Database/factories/UserFactory";

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await UserFactory.createMany(10);
  }
}
