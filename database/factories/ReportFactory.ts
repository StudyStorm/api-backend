import report from "App/Models/report";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "Database/factories/UserFactory";
import { CardFactory } from "Database/factories/CardFactory";

export const ReportFactory = Factory.define(report, ({ faker }) => ({
  message: faker.lorem.sentence(),
  isRead: faker.datatype.boolean(),
}))
  .relation("card", () => CardFactory)
  .relation("author", () => UserFactory)
  .build();
