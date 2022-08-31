import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  BelongsTo,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import Folder from "./Folder";
import Card from "./Card";
import { v4 as uuid } from "uuid";
import User from "./User";
import Rating from "App/Models/Rating";

export default class Deck extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public folderId: string;

  @column()
  public creatorId: string;

  @belongsTo(() => Folder, {
    foreignKey: "folderId",
  })
  public folder: BelongsTo<typeof Folder>;

  @belongsTo(() => User, {
    foreignKey: "creatorId",
  })
  public creator: BelongsTo<typeof User>;

  @hasMany(() => Card, {
    foreignKey: "deckId",
  })
  public cards: HasMany<typeof Card>;

  @hasMany(() => Rating)
  public ratings: HasMany<typeof Rating>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(deck: Deck) {
    deck.id = uuid();
  }
}
