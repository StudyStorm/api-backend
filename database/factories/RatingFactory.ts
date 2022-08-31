import Rating from "App/Models/Rating";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "Database/factories/UserFactory";
import { DeckFactory } from "Database/factories/DeckFactory";

export const RatingFactory = Factory.define(Rating, ({ faker }) => {
  return {
    vote: faker.helpers.arrayElement([-1, 1]),
  };
})
  .relation("user", () => UserFactory)
  .relation("deck", () => DeckFactory)
  .build();
