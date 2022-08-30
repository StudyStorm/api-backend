declare module "@ioc:Adonis/Core/Validator" {
  interface Rules {
    /**
     * Mutates the value to capitalize the first letter of each word
     */
    capitalize(): Rule;
  }
}
