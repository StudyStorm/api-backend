import { validator } from "@ioc:Adonis/Core/Validator";

/**
 * Capitalize name
 */
validator.rule("capitalize", (value, _, options) => {
  if (typeof value !== "string") {
    return;
  }
  options.mutate(value.replace(/\b(\w)/g, (s) => s.toUpperCase()));
});
