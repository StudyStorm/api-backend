import Factory from "@ioc:Adonis/Lucid/Factory";
import User from "App/Models/User";

export const UserFactory = Factory.define(User, ({ faker }) => {
  const lastName = faker.name.lastName();
  const firstName = faker.name.firstName();
  return {
    password: faker.internet.password(),
    firstName,
    lastName,
    email: faker.internet.email(firstName, lastName),
    isEmailVerified: faker.datatype.boolean(),
  };
}).build();
