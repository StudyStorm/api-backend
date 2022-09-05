import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  beforeSave,
  column,
  computed,
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
import Report from "App/Models/Report";
import Route from "@ioc:Adonis/Core/Route";
import Env from "@ioc:Adonis/Core/Env";
import { MultipartFileContract } from "@ioc:Adonis/Core/BodyParser";
import sharp from "sharp";
import Drive from "@ioc:Adonis/Core/Drive";

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column({ serializeAs: null })
  public isSuperAdmin: boolean;

  @column()
  public email: string;

  @column({ serializeAs: null })
  public password: string;

  @column()
  public firstName: string;

  @column()
  public lastName: string;

  @column({ serializeAs: null })
  public profilePicture: string;

  @column({ serializeAs: null })
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

  @manyToMany(() => Deck, {
    pivotTable: "ratings",
    pivotColumns: ["vote"],
    serializeAs: "voted_decks",
  })
  public votedDecks: ManyToMany<typeof Deck>;

  @hasMany(() => Report, { serializeAs: "reported_cards" })
  public reportedCards: HasMany<typeof Report>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @computed()
  public get picture_url() {
    return Route.makeUrl(
      "profilePicture",
      { id: this.id },
      { prefixUrl: Env.get("APP_URL") }
    );
  }

  public static async uploadProfilePicture(
    user: User,
    file: MultipartFileContract
  ) {
    const buffer = await sharp(file.tmpPath).resize(200, 200).toBuffer();
    const filePath = `data_user/${user.id}/avatar.png`;
    await Drive.put(filePath, buffer);
    await user.merge({ profilePicture: filePath }).save();
  }

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
