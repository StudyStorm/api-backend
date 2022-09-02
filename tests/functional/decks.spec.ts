import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { ClassroomFactory } from "Database/factories/ClassroomFactory";
import { ClassroomAccessRight } from "App/Models/Classroom";
import { UserFactory } from "Database/factories/UserFactory";

test.group("Decks", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("Should retrieve all user's accessible decks", async ({
    client,
    assert,
  }) => {
    // Public classroom
    await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 5)
    )
      .apply("public")
      .create();

    // Accessible classroom (read)
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("private")
      .create();

    // Not accessible classroom
    await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 5)
    )
      .apply("private")
      .create();

    const decks = await client
      .get("v1/decks")
      .loginAs(accessibleClassroom.users[0]);

    decks.assertStatus(200);
    assert.equal(decks.body().meta.total, 10);
  });

  test("Should retrieve empty is no accessible decks", async ({
    client,
    assert,
  }) => {
    const accessibleClassroom = await ClassroomFactory.with(
      "users",
      1,
      (user) => user.pivotAttributes({ access_right: ClassroomAccessRight.R })
    )
      .apply("private")
      .create();

    await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 5)
    )
      .apply("private")
      .create();

    const decks = await client
      .get("v1/decks")
      .loginAs(accessibleClassroom.users[0]);

    decks.assertStatus(200);
    assert.equal(decks.body().meta.total, 0);
  });

  test("Should retrieve a deck with its cards", async ({ assert, client }) => {
    // Public
    const pubClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5, (deck) => deck.with("cards", 2))
    )
      .apply("public")
      .create();

    // Accessible
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5, (deck) => deck.with("cards", 2))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("private")
      .create();

    const publicDeck = pubClassroom.rootFolder.decks[0];
    const accessibleDeck = accessibleClassroom.rootFolder.decks[0];

    const accessToPublicDeck = await client
      .get(`v1/decks/${publicDeck.id}`)
      .loginAs(accessibleClassroom.users[0]);

    accessToPublicDeck.assertStatus(200);
    assert.equal(accessToPublicDeck.body().cards.length, 2);

    const accessToAccessibleDeck = await client
      .get(`v1/decks/${accessibleDeck.id}`)
      .loginAs(accessibleClassroom.users[0]);

    accessToAccessibleDeck.assertStatus(200);
    assert.equal(accessToAccessibleDeck.body().cards.length, 2);
  });

  test("Should not be able to retrieve a deck that is not accessible", async ({
    client,
  }) => {
    const user = await UserFactory.create();
    const unaccessible = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .apply("private")
      .create();

    const decks = await client
      .get(`v1/decks/${unaccessible.rootFolder.decks[0].id}`)
      .loginAs(user);

    decks.assertStatus(403);
  });

  test("Should be able to change deck name", async ({ client }) => {
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RW })
      )
      .apply("private")
      .create();

    const response = await client
      .patch(`v1/decks/${accessibleClassroom.rootFolder.decks[0].id}`)
      .json({ name: "new name" })
      .loginAs(accessibleClassroom.users[0]);

    response.assertStatus(200);
    response.assertBodyContains({ name: "new name" });
  });

  test("Should be able to change deck folder", async ({ client }) => {
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) =>
        folder
          .with("children", 5, (child) => child.with("decks", 2))
          .with("decks", 2)
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RWD })
      )
      .apply("private")
      .create();

    accessibleClassroom.rootFolder.children[0].classroomId =
      accessibleClassroom.id;
    await accessibleClassroom.rootFolder.children[0].save();

    const response = await client
      .patch(`v1/decks/${accessibleClassroom.rootFolder.decks[0].id}`)
      .json({
        folderId: accessibleClassroom.rootFolder.children[0].id,
      })
      .loginAs(accessibleClassroom.users[0]);

    response.assertStatus(200);

    response.assertBodyContains({
      id: accessibleClassroom.rootFolder.decks[0].id,
    });
  });

  test("Should not be able to change deck information if no access to deck", async ({
    client,
  }) => {
    // No access
    const user = await UserFactory.create();
    const unaccessible = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .apply("private")
      .create();

    const decks = await client
      .patch(`v1/decks/${unaccessible.rootFolder.decks[0].id}`)
      .json({ name: "new name" })
      .loginAs(user);

    decks.assertStatus(403);

    // Unsufficient access
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5, (deck) => deck.with("cards", 2))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("private")
      .create();

    const decksRead = await client
      .patch(`v1/decks/${accessibleClassroom.rootFolder.decks[0].id}`)
      .json({ name: "new name" })
      .loginAs(user);

    decksRead.assertStatus(403);
  });

  test("Should not be able to change deck folder if no access to folder", async ({
    client,
  }) => {
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RW })
      )
      .apply("private")
      .create();

    // Not accessible classroom
    const noAccess = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder
        .with("children", 5, (child) => child.with("decks", 2))
        .with("decks", 2)
    )
      .apply("private")
      .create();

    const response = await client
      .patch(`v1/decks/${accessibleClassroom.rootFolder.decks[0].id}`)
      .json({
        folderId: noAccess.rootFolder.children[2].id,
      })
      .loginAs(accessibleClassroom.users[0]);

    response.assertStatus(403);
  });

  test("Should be able to delete deck", async ({ client }) => {
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5, (deck) => deck.with("cards", 2))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RWD })
      )
      .apply("private")
      .create();

    const accessibleDeck = accessibleClassroom.rootFolder.decks[0];

    const response = await client
      .delete(`v1/decks/${accessibleDeck.id}`)
      .loginAs(accessibleClassroom.users[0]);

    response.assertStatus(200);
  });

  test("Should not be able to move a deck into another classroom", async ({
    client,
  }) => {
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RW })
      )
      .apply("private")
      .create();

    const accessibleClassroom2 = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({
          user_id: accessibleClassroom.users[0].id,
          access_right: ClassroomAccessRight.RW,
        })
      )
      .apply("private")
      .create();

    accessibleClassroom.rootFolder.classroomId = accessibleClassroom.id;
    await accessibleClassroom.rootFolder.save();

    accessibleClassroom2.rootFolder.classroomId = accessibleClassroom2.id;
    await accessibleClassroom2.rootFolder.save();

    const response = await client
      .patch(`v1/decks/${accessibleClassroom.rootFolder.decks[0].id}`)
      .json({ folderId: accessibleClassroom2.rootFolder.id })
      .loginAs(accessibleClassroom.users[0]);

    response.assertStatus(403);
  });

  test("Should not be able to delete deck if no access to deck", async ({
    client,
  }) => {
    // Without any rights
    const user = await UserFactory.create();
    const unaccessible = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .apply("private")
      .create();

    const decks = await client
      .delete(`v1/decks/${unaccessible.rootFolder.decks[0].id}`)
      .loginAs(user);

    decks.assertStatus(403);

    // Without delete rights
    const accessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5, (deck) => deck.with("cards", 2))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("private")
      .create();

    const accessibleDeck = accessibleClassroom.rootFolder.decks[0];

    const response = await client
      .delete(`v1/decks/${accessibleDeck.id}`)
      .loginAs(accessibleClassroom.users[0]);

    response.assertStatus(403);
  });

  test("Should be able to add a card to a deck", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) => deck.with("cards", 4))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RW })
      )
      .apply("public")
      .create();

    const response = await client
      .post("v1/decks/cards")
      .json({
        deckId: classroom.rootFolder.decks[0].id,
        content: {
          question: "Test question",
          answers: [
            {
              label: "A",
              isTheAnswer: false,
            },
            {
              label: "B",
              isTheAnswer: true,
            },
          ],
          type: "test",
        },
      })
      .loginAs(classroom.users[0]);

    response.assertStatus(201);
  });

  test("Should not be able to add a card to a deck if no access to deck", async ({
    client,
  }) => {
    const unauthorizedUser = await UserFactory.create();
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) => deck.with("cards", 4))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RW })
      )
      .apply("public")
      .create();

    const response = await client
      .post("v1/decks/cards")
      .json({
        deckId: classroom.rootFolder.decks[0].id,
        content: {
          question: "Test question",
          answers: [
            {
              label: "A",
              isTheAnswer: false,
            },
            {
              label: "B",
              isTheAnswer: true,
            },
          ],
          type: "test",
        },
      })
      .loginAs(unauthorizedUser);

    response.assertStatus(403);
  });

  test("Should be able to update a card", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) => deck.with("cards", 4))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RW })
      )
      .apply("public")
      .create();

    const content = {
      question: "Test question",
      answers: [
        {
          label: "A",
          isTheAnswer: false,
        },
        {
          label: "B",
          isTheAnswer: true,
        },
      ],
      type: "test",
    };

    const response = await client
      .patch(`v1/decks/cards/${classroom.rootFolder.decks[0].cards[0].id}`)
      .json(content)
      .loginAs(classroom.users[0]);

    response.assertStatus(200);
    response.assertBodyContains({ content: content });
  });

  test("Should be able to get vote for a deck", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) =>
        deck
          .with("ratings", 15, (rating) => {
            rating.pivotAttributes({ vote: 1 });
          })
          .with("ratings", 5, (rating) => {
            rating.pivotAttributes({ vote: -1 });
          })
      )
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("public")
      .create();
    const user = classroom.users[0];
    const deck = classroom.rootFolder.decks[0];
    const response = await client.get(`v1/decks/${deck.id}/rate`).loginAs(user);
    response.assertStatus(200);
    response.assertBodyContains({
      vote: 10,
      count: 20,
    });
  });

  test("Should be able to vote for a deck", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) =>
        deck
          .with("ratings", 15, (rating) => {
            rating.pivotAttributes({ vote: 1 });
          })
          .with("ratings", 5, (rating) => {
            rating.pivotAttributes({ vote: -1 });
          })
      )
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("public")
      .create();
    const user = classroom.users[0];
    const deck = classroom.rootFolder.decks[0];
    const response = await client
      .post(`v1/decks/${deck.id}/rate`)
      .loginAs(user)
      .json({ vote: -1 });
    response.assertStatus(200);
    response.assertBodyContains({
      vote: 9,
      count: 21,
    });
  });

  test("Should be able to change vote for a deck", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) =>
        deck
          .with("ratings", 15, (rating) => {
            rating.pivotAttributes({ vote: 1 });
          })
          .with("ratings", 5, (rating) => {
            rating.pivotAttributes({ vote: -1 });
          })
      )
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("public")
      .create();
    const user = classroom.users[0];
    const deck = classroom.rootFolder.decks[0];
    await client
      .post(`v1/decks/${deck.id}/rate`)
      .loginAs(user)
      .json({ vote: -1 });
    const response = await client
      .post(`v1/decks/${deck.id}/rate`)
      .loginAs(user)
      .json({ vote: 1 });
    response.assertStatus(200);
    response.assertBodyContains({
      vote: 11,
      count: 21,
    });
  });

  test("Should able to delete vote for a deck", async ({ client, assert }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) =>
        deck
          .with("ratings", 15, (rating) => {
            rating.pivotAttributes({ vote: 1 });
          })
          .with("ratings", 5, (rating) => {
            rating.pivotAttributes({ vote: -1 });
          })
      )
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("public")
      .create();
    const user = classroom.users[0];
    const deck = classroom.rootFolder.decks[0];
    await client
      .post(`v1/decks/${deck.id}/rate`)
      .loginAs(user)
      .json({ vote: -1 });
    await deck.load("ratings");
    assert.equal(deck.ratings.length, 21);
    const response = await client
      .delete(`v1/decks/${deck.id}/rate`)
      .loginAs(user);
    response.assertStatus(200);
    await deck.load("ratings");
    assert.equal(deck.ratings.length, 20);
  });

  test("Should not be able to update a card with no write rights", async ({
    client,
  }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) => deck.with("cards", 4))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("public")
      .create();

    const content = {
      question: "Test question",
      answers: [
        {
          label: "A",
          isTheAnswer: false,
        },
        {
          label: "B",
          isTheAnswer: true,
        },
      ],
      type: "test",
    };

    const response = await client
      .patch(`v1/decks/cards/${classroom.rootFolder.decks[0].cards[0].id}`)
      .json(content)
      .loginAs(classroom.users[0]);

    response.assertStatus(403);
  });

  test("Should be able to delete a card", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) => deck.with("cards", 4))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RWD })
      )
      .apply("public")
      .create();
    const response = await client
      .delete(`v1/decks/cards/${classroom.rootFolder.decks[0].cards[0].id}`)
      .loginAs(classroom.users[0]);

    response.assertStatus(200);
    response.assertBodyContains({ message: "Card deleted successfully" });
  });

  test("Should not be able to delete a card with no delete rights", async ({
    client,
  }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) => deck.with("cards", 4))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.RW })
      )
      .apply("public")
      .create();
    const response = await client
      .delete(`v1/decks/cards/${classroom.rootFolder.decks[0].cards[0].id}`)
      .loginAs(classroom.users[0]);

    response.assertStatus(403);
  });

  test("Should be able to report a card", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) => deck.with("cards", 4))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("public")
      .create();
    const response = await client
      .post(
        `v1/decks/cards/${classroom.rootFolder.decks[0].cards[0].id}/report`
      )
      .json({
        message: "test",
      })
      .loginAs(classroom.users[0]);

    response.assertStatus(201);
    response.assertBodyContains({ message: "test" });
  });

  test("Should not be able to report a card with no rights to see the deck", async ({
    client,
  }) => {
    const unauthorizedUser = await UserFactory.create();
    const classroom = await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 1, (deck) => deck.with("cards", 4))
    )
      .with("users", 1, (user) =>
        user.pivotAttributes({ access_right: ClassroomAccessRight.R })
      )
      .apply("private")
      .create();
    const response = await client
      .post(
        `v1/decks/cards/${classroom.rootFolder.decks[0].cards[0].id}/report`
      )
      .json({
        message: "test",
      })
      .loginAs(unauthorizedUser);

    response.assertStatus(403);
  });
});
