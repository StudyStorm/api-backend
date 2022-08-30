import Card from "App/Models/Card";
import Factory from "@ioc:Adonis/Lucid/Factory";

export default Factory.define(Card, ({ faker }) => ({
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
})).build();
