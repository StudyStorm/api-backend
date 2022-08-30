import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "folders";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid("parent_id").references("folders.id");
      table.uuid("folder_id").references("folders.id");
      table.uuid("deck_id").references("decks.id");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("parent_id");
      table.dropColumn("folder_id");
      table.dropColumn("deck_id");
    });
  }
}
