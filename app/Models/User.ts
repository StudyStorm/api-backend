import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  beforeSave,
  column,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import Hash from "@ioc:Adonis/Core/Hash";
import { v4 as uuid } from "uuid";
import Classroom from "./Classroom";

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

  @manyToMany(() => Classroom)
  public classrooms: ManyToMany<typeof Classroom>;

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
