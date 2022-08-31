import Card from "App/Models/Card";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { ReportFactory } from "Database/factories/ReportFactory";

export const CardFactory = Factory.define(Card, ({ faker }) => ({
  content: {
    question: faker.lorem.sentence(),
    answers: faker.helpers.uniqueArray(
      () => ({
        label: faker.lorem.sentence(),
        isTheAnswer: faker.datatype.boolean(),
      }),
      faker.datatype.number({ min: 1, max: 5 })
    ),
    type: "string",
  },
}))
  .relation("reports", () => ReportFactory)
  .build();
