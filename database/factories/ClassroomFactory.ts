import Classroom, { ClassroomVisibility } from "App/Models/Classroom";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "./UserFactory";
import { RootFolderFactory } from "Database/factories/RootFolderFactory";

export const ClassroomFactory = Factory.define(
  Classroom,
  async ({ faker }) => ({
    name: faker.word.noun(),
    visibility: faker.helpers.arrayElement(Object.values(ClassroomVisibility)),
  })
)
  .relation("rootFolder", () => RootFolderFactory)
  .relation("users", () => UserFactory)
  .build();
