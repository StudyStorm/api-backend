import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  BelongsTo,
  column,
  scope,
} from "@ioc:Adonis/Lucid/Orm";
import User from "App/Models/User";
import { v4 as uuid } from "uuid";
import Card from "App/Models/Card";

export default class Report extends BaseModel {
  public static canRead = scope<typeof Report>((query, user: User) => {
    query.whereHas("card", (cardBuilder) => {
      cardBuilder.whereHas("deck", (deckBuilder) => {
        deckBuilder.where("creator_id", user.id);
      });
    });
  });

  @column({ isPrimary: true })
  public id: string;

  @column()
  public message: string;

  @column()
  public isRead: boolean;

  @column()
  public cardId: string;

  @belongsTo(() => Card, {
    foreignKey: "cardId",
  })
  public card: BelongsTo<typeof Card>;

  @column()
  public authorId: string;

  @belongsTo(() => User, {
    foreignKey: "authorId",
  })
  public author: BelongsTo<typeof User>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(report: Report) {
    report.id = uuid();
  }
}
