import { BaseModel, BelongsTo, belongsTo, column } from "@ioc:Adonis/Lucid/Orm";
import User from "App/Models/User";
import Deck from "App/Models/Deck";

export default class Rating extends BaseModel {
  @column() // doesn't exist in the database
  public id: undefined;

  @column()
  public vote: number;

  @column({ isPrimary: true })
  public deckId: string;

  @belongsTo(() => Deck, {
    foreignKey: "deckId",
  })
  public deck: BelongsTo<typeof Deck>;

  @column({ isPrimary: true })
  public userId: string;

  @belongsTo(() => User, {
    foreignKey: "userId",
  })
  public user: BelongsTo<typeof User>;
}
