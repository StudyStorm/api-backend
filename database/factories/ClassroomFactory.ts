import Classroom, { ClassroomVisibility } from "App/Models/Classroom";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "./UserFactory";
import { RootFolderFactory } from "Database/factories/RootFolderFactory";

export const ClassroomFactory = Factory.define(
  Classroom,
  async ({ faker }) => ({
    name: faker.lorem.slug(3),
    visibility: faker.helpers.arrayElement(Object.values(ClassroomVisibility)),
  })
)
  .state(
    "public",
    (classroom) => (classroom.visibility = ClassroomVisibility.PUBLIC)
  )
  .state(
    "private",
    (classroom) => (classroom.visibility = ClassroomVisibility.PRIVATE)
  )
  .relation("rootFolder", () => RootFolderFactory)
  .relation("users", () => UserFactory)
  .build();
