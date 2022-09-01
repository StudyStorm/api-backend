import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { ClassroomFactory } from "../../database/factories/ClassroomFactory";
import { ClassroomVisibility } from "App/Models/Classroom";
import { ClassroomAccessRight } from "../../app/Models/Classroom";

test.group("Decks", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("Should retrieve all user's accessible decks", async ({ client }) => {
    await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 5)
    )
      .merge({
        visibility: ClassroomVisibility.PUBLIC,
      })
      .create();

    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .merge({
        visibility: ClassroomVisibility.PRIVATE,
      })
      .create();

    const notAccessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .merge({
        visibility: ClassroomVisibility.PRIVATE,
      })
      .create();

    const user = accessibleClassroom.users[0];

    console.log(notAccessibleClassroom.rootFolder.decks.length);

    // call the api
    const decks = await client.get("v1/decks").loginAs(user);

    console.dir(decks.body().meta.total);

    // await publicClassroom.rootFolder.related("decks");

    // publicClassroom.rootFolder.decks.push(...(await DeckFactory.createMany(5)));
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
