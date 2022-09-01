import { rules, schema } from "@ioc:Adonis/Core/Validator";
import { ClassroomAccessRight } from "App/Models/Classroom";

export default schema.create({
  classroomId: schema.string(),
  email: schema.string({ trim: true }, [rules.email()]),
  accessRight: schema.enum(Object.values(ClassroomAccessRight)),
});
