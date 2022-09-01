import { rules, schema } from "@ioc:Adonis/Core/Validator";

export default schema.create({
  name: schema.string({ trim: true }, [rules.minLength(3)]),
});
