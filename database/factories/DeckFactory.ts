import Deck from "App/Models/Deck";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { CardFactory } from "./CardFactory";
import { UserFactory } from "Database/factories/UserFactory";

export const DeckFactory = Factory.define(Deck, ({ faker }) => ({
  name: faker.word.noun(),
}))
  .relation("creator", () => UserFactory)
  .relation("cards", () => CardFactory)
  .relation("ratings", () => UserFactory)
  .build();
