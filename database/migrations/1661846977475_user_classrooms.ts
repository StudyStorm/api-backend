import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import { ClassroomAccessRight } from "App/Models/Classroom";

export default class extends BaseSchema {
  protected tableName = "user_classrooms";

  public async up() {
    this.schema.raw('DROP TYPE IF EXISTS "access_right"');

    this.schema.createTable(this.tableName, (table) => {
      table.primary(["classroom_id", "user_id"]);
      table
        .enu("access_right", Object.values(ClassroomAccessRight), {
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
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
