import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import ClassroomFactory from "Database/factories/ClassroomFactory";

export default class extends BaseSeeder {
  public async run() {
    await ClassroomFactory.createMany(10);
  }
}
