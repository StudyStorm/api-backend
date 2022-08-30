import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  column,
  ManyToMany,
  manyToMany,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuid } from "uuid";
import User from "./User";

export interface CardContent {
  question: string;
  answers: Array<{ label: string; isTheAnswer: boolean }>;
  type: string;
}

export default class Card extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public content: CardContent;

  @manyToMany(() => User)
  public reports: ManyToMany<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(card: Card) {
    card.id = uuid();
  }
}
