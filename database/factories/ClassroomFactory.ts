import Classroom, { ClassroomVisibility } from "App/Models/Classroom";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "./UserFactory";
import Folder from "App/Models/Folder";

export default Factory.define(Classroom, async ({ faker }) => ({
  name: faker.word.noun(),
  visibility: faker.helpers.arrayElement(Object.values(ClassroomVisibility)),
  rootFolder: (await Folder.create({ name: "root" })).id,
}))
  .relation("users", () => UserFactory)
  .build();
