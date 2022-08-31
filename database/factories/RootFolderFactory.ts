import Folder from "App/Models/Folder";
import Factory from "@ioc:Adonis/Lucid/Factory";

export const RootFolderFactory = Factory.define(Folder, () => ({
  name: "root",
})).build();
