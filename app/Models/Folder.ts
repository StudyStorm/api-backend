import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  BelongsTo,
  column,
  computed,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuid } from "uuid";
import Deck from "./Deck";
import User from "./User";
import Classroom from "App/Models/Classroom";

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

  @computed()
  public get path() {
    return this.$extras.path;
  }

  @beforeCreate()
  public static assignUuid(folder: Folder) {
    folder.id = uuid();
  }

  public getDescendantFolders() {
    if (!this.$isPersisted) throw new Error();
    return Folder.getDescendantFolders(this.id);
  }
  public static getDescendantFolders(id: string) {
    return Folder.query()
      .withRecursive("tree", (query) => {
        query
          .from("folders as f1")
          .select("f1.*")
          .where("f1.id", id)
          .union((subquery) => {
            subquery
              .from("folders as f2")
              .select("f2.*")
              .join("tree as t", "t.parent_id", "f2.id");
          });
      })
      .from("tree");
  }

  public getAscendantFolders() {
    if (!this.$isPersisted) throw new Error();
    return Folder.getAscendantFolders(this.id);
  }
  public static getAscendantFolders(id: string) {
    return Folder.query()
      .withRecursive("tree", (query) => {
        query
          .from("folders as f1")
          .select("f1.*")
          .where("f1.id", id)
          .unionAll((subquery) => {
            subquery
              .from("folders as f2")
              .select("f2.*")
              .join("tree as t", "t.id", "f2.parent_id");
          });
      })
      .from("tree");
  }
}
