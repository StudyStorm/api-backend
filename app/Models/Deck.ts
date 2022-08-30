import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  column,
  HasMany,
  hasMany,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Folder from "./Folder";
import Card from "./Card";
import { v4 as uuid } from "uuid";
import User from "./User";

export default class Deck extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @hasOne(() => Folder)
  public folder: HasOne<typeof Folder>;

  @hasMany(() => Card)
  public cards: HasMany<typeof Card>;

  @manyToMany(() => User)
  public votes: ManyToMany<typeof User>;

  @hasOne(() => User)
  public creator: HasOne<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(deck: Deck) {
    deck.id = uuid();
  }
}
