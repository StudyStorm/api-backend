import Folder from "App/Models/Folder";
import Factory from "@ioc:Adonis/Lucid/Factory";
import { DeckFactory } from "./DeckFactory";
import { FolderFactory } from "./FolderFactory";

export const RootFolderFactory = Factory.define(Folder, () => ({
  name: "root",
}))
  .relation("children", () => FolderFactory)
  .relation("decks", () => DeckFactory)
  .build();
