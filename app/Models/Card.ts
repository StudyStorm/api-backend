import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  BelongsTo,
  belongsTo,
  column,
  HasMany,
  hasMany,
} from "@ioc:Adonis/Lucid/Orm";
import { v4 as uuid } from "uuid";
import Deck from "./Deck";
import Report from "App/Models/Report";

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

  @column()
  public deckId: string;

  @belongsTo(() => Deck, {
    foreignKey: "deckId",
  })
  public deck: BelongsTo<typeof Deck>;

  @hasMany(() => Report)
  public reports: HasMany<typeof Report>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(card: Card) {
    card.id = uuid();
  }
}
