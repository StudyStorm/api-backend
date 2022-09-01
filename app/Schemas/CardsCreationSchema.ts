import { schema } from "@ioc:Adonis/Core/Validator";

export default schema.create({
  deckId: schema.string({ trim: true }),
  content: schema.object().members({
    question: schema.string(),
    answers: schema.array().members(
      schema.object().members({
        label: schema.string(),
        isTheAnswer: schema.boolean(),
      })
    ),
    type: schema.string(),
  }),
});
