import { DateTime } from "luxon";
import {
  BaseModel,
  column,
  beforeCreate,
  manyToMany,
  ManyToMany,
  scope,
  hasMany,
  HasMany,
  hasOne,
  HasOne,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuid } from "uuid";
import Folder from "./Folder";
import User from "./User";
import Database from "@ioc:Adonis/Lucid/Database";

export enum ClassroomVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
}

export enum ClassroomAccessRight {
  R = "read",
  RW = "read_write",
  RWD = "read_write_delete",
  OWNER = "owner",
  SUBSCRIBER = "subscriber",
}

export default class Classroom extends BaseModel {
  public static joined = scope<typeof Classroom>((query, user: User) => {
    query.whereHas("users", (builder) => {
      builder.where("user_id", user.id).andWhere((sub) => {
        sub
          .where("visibility", ClassroomVisibility.PUBLIC)
          .orWhereNot("access_right", ClassroomAccessRight.SUBSCRIBER);
      });
    });
  });
  public static canRead = scope<typeof Classroom>((query, user: User) => {
    if (user.isSuperAdmin) return;
    query.andWhere((sub) => {
      sub
        .andWhere("visibility", ClassroomVisibility.PUBLIC)
        .orWhereHas("users", (builder) => {
          builder.where("user_id", user.id);
        });
    });
  });
  public static canWrite = scope<typeof Classroom>((query, user: User) => {
    if (user.isSuperAdmin) return;
    query.whereHas("users", (builder) => {
      builder.where("user_id", user.id).andWhere((sub) => {
        sub
          .where("access_right", ClassroomAccessRight.RW)
          .orWhere("access_right", ClassroomAccessRight.RWD)
          .orWhere("access_right", ClassroomAccessRight.OWNER);
      });
    });
  });

  public static getPermissions = scope<typeof Classroom>(
    async (query, user: User) => {
      query.select("*").withCount("users", (builder) => {
        builder.where("user_id", user.id).as("is_member");
      });
      if (user.isSuperAdmin) {
        query
          .select(Database.raw("1 as can_write"))
          .select(Database.raw("1 as can_delete"))
          .select(Database.raw("1 as is_owner"));
      } else {
        query
          .withCount("users", (builder) => {
            builder
              .andWhere("user_id", user.id)
              .andWhere((sub) => {
                sub
                  .where("access_right", ClassroomAccessRight.RW)
                  .orWhere("access_right", ClassroomAccessRight.RWD)
                  .orWhere("access_right", ClassroomAccessRight.OWNER);
              })
              .as("can_write");
          })
          .withCount("users", (builder) => {
            builder
              .andWhere("user_id", user.id)
              .andWhere((sub) => {
                sub
                  .orWhere("access_right", ClassroomAccessRight.RWD)
                  .orWhere("access_right", ClassroomAccessRight.OWNER);
              })
              .as("can_delete");
          })
          .withCount("users", (builder) => {
            builder
              .andWhere("user_id", user.id)
              .andWhere("access_right", ClassroomAccessRight.OWNER)
              .as("is_owner");
          });
      }
    }
  );

  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public visibility: ClassroomVisibility;

  @hasOne(() => Folder, {
    onQuery: (query) => {
      query.whereNull("parent_id");
    },
    serializeAs: "root_folder",
  })
  public rootFolder: HasOne<typeof Folder>;

  @hasMany(() => Folder)
  public folders: HasMany<typeof Folder>;

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

  public serializeExtras() {
    return {
      permissions: {
        write: +this.$extras.can_write > 0,
        delete: +this.$extras.can_delete > 0,
        is_owner: +this.$extras.is_owner > 0,
        is_member: +this.$extras.is_member > 0,
      },
      nb_members: +this.$extras.nb_members,
    };
  }
}
