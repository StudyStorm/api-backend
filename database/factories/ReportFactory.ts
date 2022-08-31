import Report from "App/Models/Report";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "Database/factories/UserFactory";
import { CardFactory } from "Database/factories/CardFactory";

export const ReportFactory = Factory.define(Report, ({ faker }) => ({
  message: faker.lorem.sentence(),
  isRead: faker.datatype.boolean(),
}))
  .relation("card", () => CardFactory)
  .relation("author", () => UserFactory)
  .build();
