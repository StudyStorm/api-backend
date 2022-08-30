import Classroom, { ClassroomVisibility } from "App/Models/Classroom";
import Factory from "@ioc:Adonis/Lucid/Factory";

export default Factory.define(Classroom, ({ faker }) => ({
  name: faker.word.noun(),
  visibility: faker.helpers.arrayElement(Object.values(ClassroomVisibility)),
})).build();
