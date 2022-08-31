import Folder from "App/Models/Folder";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { UserFactory } from "Database/factories/UserFactory";
import { DeckFactory } from "Database/factories/DeckFactory";

export const FolderFactory = Factory.define(Folder, ({ faker }) => ({
  name: faker.word.noun(),
}))
  .relation("creator", () => UserFactory)
  .relation("decks", () => DeckFactory)
  .relation("children", () => FolderFactory)
  .build();
