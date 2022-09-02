import { schema } from "@ioc:Adonis/Core/Validator";

export default schema.create({
  question: schema.string(),
  answers: schema.array().members(
    schema.object.optional().members({
      label: schema.string(),
      isTheAnswer: schema.boolean(),
    })
  ),
  type: schema.string(),
});
