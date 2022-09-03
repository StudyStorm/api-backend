import { rules, schema } from "@ioc:Adonis/Core/Validator";
import { ClassroomVisibility } from "App/Models/Classroom";

export default schema.create({
  name: schema.string({ trim: true }, [
    rules.unique({ table: "classrooms", column: "name" }),
  ]),
  visibility: schema.enum(Object.values(ClassroomVisibility)),
});
