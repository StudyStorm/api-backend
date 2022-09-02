import { BasePolicy } from "@ioc:Adonis/Addons/Bouncer";
import User from "App/Models/User";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Deck from "App/Models/Deck";

export default class DeckPolicy extends BasePolicy {
  public async read(
    _user: User,
    deck: Deck,
    bouncer: HttpContextContract["bouncer"]
  ) {
    await deck.load("folder");
    return bouncer.with("FolderPolicy").allows("read", deck.folder, bouncer);
  }
  public async write(
    _user: User,
    deck: Deck,
    bouncer: HttpContextContract["bouncer"]
  ) {
    await deck.load("folder");
    return bouncer.with("FolderPolicy").allows("write", deck.folder, bouncer);
  }
  public async delete(
    _user: User,
    deck: Deck,
    bouncer: HttpContextContract["bouncer"]
  ) {
    await deck.load("folder");
    return bouncer.with("FolderPolicy").allows("delete", deck.folder, bouncer);
  }
}
