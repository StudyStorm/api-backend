import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "reports";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.unique(["card_id", "author_id"]); // only one report per user per card
      table.uuid("id").primary();
      table.string("message");
      table.boolean("is_read").defaultTo(false);

      table.uuid("card_id").references("cards.id").onDelete("CASCADE");
      table.uuid("author_id").references("users.id").onDelete("CASCADE");

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
