import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { AccessRight } from "App/Models/Classroom";

export default class extends BaseSchema {
  protected tableName = "user_classrooms";

  public async up() {
    this.schema.raw('DROP TYPE IF EXISTS "access_right"');

    this.schema.createTable(this.tableName, (table) => {
      table.primary(["classroom_id", "user_id"]);
      table
        .enu("accessRight", Object.values(AccessRight), {
          enumName: "access_right",
          useNative: true,
          existingType: false,
        })
        .notNullable();

      table.uuid("user_id").references("users.id").onDelete("CASCADE");
      table
        .uuid("classroom_id")
        .references("classrooms.id")
        .onDelete("CASCADE");

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
