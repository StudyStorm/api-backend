import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "folders";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid("parent_id").references("folders.id").onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("parent_id");
    });
  }
}
