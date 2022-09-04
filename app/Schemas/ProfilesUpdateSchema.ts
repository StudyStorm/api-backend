import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default schema.create({
  profilePicture: schema.file.optional({
    size: "2mb",
    extnames: ["jpg", "png", "gif"],
  }),
  firstName: schema.string.optional({ trim: true }, []),
  lastName: schema.string.optional({ trim: true }, []),
  password: schema.string.optional({ trim: true }, [rules.minLength(6)]),
});
