import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";

test.group("Decks", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("Should retrieve all user's accessible decks", async () => {
    //
  });

  test("Should retrieve empty is no accessible decks", async () => {
    //
  });

  test("Should retrieve a deck with its cards", async () => {
    //
  });

  test("Should not be able to retrieve a deck that is not accessible", async () => {
    //
  });

  test("Should be able to change deck name", async () => {
    //
  });

  test("Should be able to change deck folder", async () => {
    //
  });

  test("Should not be able to change deck information if no acess to deck", async () => {
    //
  });

  test("Should not be able to change deck folder if no access to folder", async () => {
    //
  });

  test("Should be able to delete deck", async () => {
    //
  });

  test("Should not be able to delete deck if no access to deck", async () => {
    //
  });

  test("Should be able to add a card to a deck", async () => {
    //
  });

  test("Should not be able to add a card to a deck if no access to deck", async () => {
    //
  });
});
