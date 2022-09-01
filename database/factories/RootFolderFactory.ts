import Folder from "App/Models/Folder";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { DeckFactory } from "./DeckFactory";

export const RootFolderFactory = Factory.define(Folder, () => ({
  name: "root",
}))
  .relation("decks", () => DeckFactory)
  .build();
