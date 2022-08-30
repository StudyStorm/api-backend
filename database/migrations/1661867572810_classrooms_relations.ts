import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class extends BaseSchema {
  protected tableName = "classrooms";

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .uuid("root_folder_id")
        .references("folders.id")
        .notNullable()
        .onDelete("CASCADE");
    });
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("root_folder_id");
    });
  }
}
