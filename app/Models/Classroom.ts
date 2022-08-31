import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  beforeCreate,
  manyToMany,
  ManyToMany,
  BelongsTo,
  belongsTo,
  scope,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuid } from "uuid";
import Folder from "./Folder";
import User from "./User";

export enum ClassroomVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum ClassroomAccessRight {
  R = "read",
  RW = "read_write",
  RWD = "read_write_delete",
  OWNER = "owner",
}

export default class Classroom extends BaseModel {
  public static canRead = scope<typeof Classroom>((query, user: User) => {
    query
      .where("visibility", ClassroomVisibility.PUBLIC)
      .orWhereHas("users", (builder) => {
        builder.where("user_id", user.id);
      });
  });
  public static canWrite = scope<typeof Classroom>((query, user: User) => {
    query.whereHas("users", (builder) => {
      builder.where("user_id", user.id).andWhere((sub) => {
        sub
          .where("access_right", ClassroomAccessRight.RW)
          .orWhere("access_right", ClassroomAccessRight.RWD)
          .orWhere("access_right", ClassroomAccessRight.OWNER);
      });
    });
  });

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
