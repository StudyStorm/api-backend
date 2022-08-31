import Deck from "App/Models/Deck";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { CardFactory } from "./CardFactory";
import { RatingFactory } from "Database/factories/RatingFactory";

export const DeckFactory = Factory.define(Deck, ({ faker }) => ({
  name: faker.word.noun(),
}))
  .relation("cards", () => CardFactory)
  .relation("ratings", () => RatingFactory)
  .build();
