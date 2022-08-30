import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  column,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuid } from "uuid";
import Deck from "./Deck";
import User from "./User";

export default class Folder extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @hasOne(() => Folder)
  public parent: HasOne<typeof Folder>;

  @hasMany(() => Folder)
  public children: HasMany<typeof Folder>;

  @hasMany(() => Deck)
  public decks: HasMany<typeof Deck>;

  @hasOne(() => User)
  public creator: HasOne<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(folder: Folder) {
    folder.id = uuid();
  }
}
