import { rules, schema } from "@ioc:Adonis/Core/Validator";
import { ClassroomVisibility } from "App/Models/Classroom";

export default schema.create({
  name: schema.string.optional({ trim: true }, [
    rules.unique({ table: "classrooms", column: "name" }),
  ]),
  visibility: schema.enum.optional(Object.values(ClassroomVisibility)),
});
