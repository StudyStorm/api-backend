import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default schema.create({
  profilePicture: schema.file.optional({
    size: "10mb",
    extnames: ["jpg", "png", "gif", "jpeg", "webp", "svg", "bmp"],
  }),
  firstName: schema.string.optional({ trim: true }, []),
  lastName: schema.string.optional({ trim: true }, []),
  password: schema.string.optional({ trim: true }, [rules.minLength(6)]),
});
