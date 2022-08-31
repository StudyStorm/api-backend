import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  beforeCreate,
  manyToMany,
  ManyToMany,
  BelongsTo,
  belongsTo,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuid } from "uuid";
import Folder from "./Folder";
import User from "./User";

export enum ClassroomVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum AccessRight {
  READ = "read",
  WRITE = "write",
  OWNER = "owner",
}

export default class Classroom extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public visibility: ClassroomVisibility;

  @column()
  public rootFolderId: string;

  @belongsTo(() => Folder, {
    foreignKey: "rootFolderId",
  })
  public rootFolder: BelongsTo<typeof Folder>;

  @manyToMany(() => User, {
    pivotTable: "user_classrooms",
    pivotColumns: ["access_right"],
  })
  public users: ManyToMany<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(classroom: Classroom) {
    classroom.id = uuid();
  }

  @beforeCreate()
  public static async assignRootFolderId(classroom: Classroom) {
    const rootFolder = await Folder.create({
      name: "root",
    });
    classroom.rootFolderId = rootFolder.id;
  }
}
