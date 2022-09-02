import { schema } from "@ioc:Adonis/Core/Validator";

export default schema.create({
  name: schema.string.optional({ trim: true }),
  folderId: schema.string.optional({ trim: true }),
});