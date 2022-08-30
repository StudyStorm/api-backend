import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import ClassroomFactory from "Database/factories/ClassroomFactory";
import { UserFactory } from "Database/factories/UserFactory";

export default class extends BaseSeeder {
  public async run() {
    // Create user

    // Create classroom with user id
    await ClassroomFactory.with("users", 4, (user) => {
      user.pivotAttributes([
        { access_right: "owner" },
        { access_right: "member" },
      ]);
    }).createMany(20);

    // Create folders with user id

    // Create decks with folder id

    // Create cards with deck id
  }
}
