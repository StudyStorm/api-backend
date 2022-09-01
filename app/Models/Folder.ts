import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  BelongsTo,
  column,
  HasMany,
  hasMany,
  ModelAssignOptions,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuid } from "uuid";
import Deck from "./Deck";
import User from "./User";
import Classroom from "./Classroom";

export default class Folder extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public creatorId: string;

  @column()
  public classroomId: string;

  @column()
  public parentId: string;

  @belongsTo(() => Classroom, {
    foreignKey: "classroomId",
  })
  public classroom: BelongsTo<typeof Classroom>;

  @belongsTo(() => User, {
    foreignKey: "creatorId",
  })
  public creator: BelongsTo<typeof User>;

  @belongsTo(() => Folder, {
    foreignKey: "parentId",
  })
  public parent: BelongsTo<typeof Folder>;

  @hasMany(() => Folder, {
    foreignKey: "parentId", // To verify
  })
  public children: HasMany<typeof Folder>;

  @hasMany(() => Deck, {
    foreignKey: "folderId",
  })
  public decks: HasMany<typeof Deck>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(folder: Folder) {
    folder.id = uuid();
  }
}
