import Classroom, { ClassroomVisibility } from "App/Models/Classroom";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "./UserFactory";

export const ClassroomFactory = Factory.define(
  Classroom,
  async ({ faker }) => ({
    name: faker.word.noun(),
    visibility: faker.helpers.arrayElement(Object.values(ClassroomVisibility)),
  })
)
  .relation("users", () => UserFactory)
  .build();
