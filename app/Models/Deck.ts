import { DateTime } from "luxon";
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  BelongsTo,
  column,
  HasMany,
  hasMany,
  ManyToMany,
  manyToMany,
  scope,
} from "@ioc:Adonis/Lucid/Orm";
import Folder from "./Folder";
import Card from "./Card";
import { v4 as uuid } from "uuid";
import User from "./User";
import { ClassroomVisibility } from "App/Models/Classroom";
import Database from "@ioc:Adonis/Lucid/Database";

export default class Deck extends BaseModel {
  public static canRead = scope<typeof Deck>((query, user: User) => {
    if (user.isSuperAdmin) return;
    query.whereHas("folder", (builder) => {
      builder.whereHas("classroom", (classroomBuilder) => {
        classroomBuilder
          .where("visibility", ClassroomVisibility.PUBLIC)
          .orWhereHas("users", (userBuilder) => {
            userBuilder.where("user_id", user.id);
          });
      });
    });
  });

  public static withVotes = scope<typeof Deck>((query) => {
    query
      .select("decks.*")
      .select(
        Database.from("ratings")
          .whereColumn("ratings.deck_id", "decks.id")
          .select(Database.raw("COALESCE(SUM(ratings.vote), 0)"))
          .as("votes")
      );
  });

  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;

  @column()
  public folderId: string;

  @column()
  public creatorId: string;

  @belongsTo(() => Folder, {
    foreignKey: "folderId",
  })
  public folder: BelongsTo<typeof Folder>;

  @belongsTo(() => User, {
    foreignKey: "creatorId",
  })
  public creator: BelongsTo<typeof User>;

  @hasMany(() => Card, {
    foreignKey: "deckId",
  })
  public cards: HasMany<typeof Card>;

  @manyToMany(() => User, {
    pivotTable: "ratings",
    pivotColumns: ["vote"],
  })
  public ratings: ManyToMany<typeof User>;

  public computedRatings: { vote: number; count: number };

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  @beforeCreate()
  public static assignUuid(deck: Deck) {
    deck.id = uuid();
  }

  public serializeExtras() {
    return {
      votes: +this.$extras.votes,
    };
  }
}
