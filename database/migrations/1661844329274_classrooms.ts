import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { ClassroomVisibility } from "../../app/Models/Classroom";

export default class extends BaseSchema {
  protected tableName = "classrooms";

  public async up() {
    this.schema.raw('DROP TYPE IF EXISTS "classroom_visibility"');
    this.schema.createTable(this.tableName, (table) => {
      table.uuid("id").primary();
      table.string("name").unique().notNullable();
      table
        .enu("visibility", Object.values(ClassroomVisibility), {
          enumName: "classroom_visibility",
          useNative: true,
          existingType: false,
        })
        .notNullable();

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
