import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "decks";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid("folder_id").references("folders.id");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("folder_id");
    });
  }
}
