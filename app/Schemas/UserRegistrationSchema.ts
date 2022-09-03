import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default schema.create({
  email: schema.string({ trim: true }, [
    rules.email(),
    rules.unique({ table: "users", column: "email" }),
  ]),
  profilePicture: schema.file.optional({
    size: "2mb",
    extnames: ["jpg", "png", "gif"],
  }),
  password: schema.string([rules.minLength(6)]),
  firstName: schema.string({ trim: true }, [rules.capitalize()]),
  lastName: schema.string({ trim: true }, [rules.capitalize()]),
});
