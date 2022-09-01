import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default schema.create({
  name: schema.string.optional({ trim: true }, [rules.minLength(3)]),
});
