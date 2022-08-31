import rating from "App/Models/rating";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "Database/factories/UserFactory";
import { DeckFactory } from "Database/factories/DeckFactory";

export const RatingFactory = Factory.define(rating, ({ faker }) => {
  return {
    vote: faker.helpers.arrayElement([-1, 1]),
  };
})
  .relation("user", () => UserFactory)
  .relation("deck", () => DeckFactory)
  .build();
