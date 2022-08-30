import Deck from "App/Models/Deck";
import Factory from "@ioc:Adonis/Lucid/Factory";
import CardFactory from "./CardFactory";
import { UserFactory } from "Database/factories/UserFactory";

export default Factory.define(Deck, ({ faker }) => ({
  name: faker.word.noun(),
}))
  .relation("cards", () => CardFactory)
  .relation("votes", () => UserFactory)
  .build();
