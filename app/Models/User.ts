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
import Deck from "./Deck";
import Folder from "./Folder";
import Rating from "App/Models/Rating";
import Report from "App/Models/Report";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public isSuperAdmin: boolean;

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
    pivotTable: "user_classrooms",
    pivotColumns: ["access_right"],
  })
  public classrooms: ManyToMany<typeof Classroom>;

  @hasMany(() => Rating)
  public votedDecks: HasMany<typeof Rating>;

  @hasMany(() => Report)
  public reportedCards: HasMany<typeof Report>;

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
