import Deck from "App/Models/Deck";
import Factory from "@ioc:Adonis/Lucid/Factory";
import CardFactory from "./CardFactory";

export default Factory.define(Deck, ({ faker }) => ({
  name: faker.word.noun(),
}))
  .relation("cards", () => CardFactory)
  .build();
