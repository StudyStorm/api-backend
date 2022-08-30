import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  beforeSave,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Hash from "@ioc:Adonis/Core/Hash";
import { v4 as uuid } from "uuid";
import Classroom from "./Classroom";
import Card from "./Card";
import Deck from "./Deck";
import Folder from "./Folder";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public firstName: string;

  @column()
  public lastName: string;

  @column()
  public profilePicture: string;

  @column()
  public isEmailVerified: boolean;

  @hasMany(() => Folder, {
    localKey: "creatorId",
  })
  public folders: HasMany<typeof Folder>;

  @hasMany(() => Deck, {
    localKey: "creatorId",
  })
  public decks: HasMany<typeof Deck>;

  @manyToMany(() => Classroom, {
    pivotTable: "classroom_user",
    pivotColumns: ["access_right"],
  })
  public classrooms: ManyToMany<typeof Classroom>;

  @manyToMany(() => Deck, {
    pivotTable: "deck_users",
    pivotColumns: ["vote"],
  })
  public votedDecks: ManyToMany<typeof Deck>;

  @manyToMany(() => Card, {
    pivotTable: "user_cards",
    pivotColumns: ["message", "is_read"],
  })
  public reportedCards: ManyToMany<typeof Card>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }

  @beforeCreate()
  public static assignUuid(user: User) {
    user.id = uuid();
  }
}
