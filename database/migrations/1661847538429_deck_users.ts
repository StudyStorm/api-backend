import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "deck_users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.primary(["deck_id", "user_id"]);
      table.integer("vote");

      table.uuid("deck_id").references("decks.id").onDelete("CASCADE");
      table.uuid("user_id").references("users.id").onDelete("CASCADE");

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
