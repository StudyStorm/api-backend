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

  test("Should retrieve all user's accessible decks", async ({ client }) => {
    await ClassroomFactory.with("rootFolder", 1, (folder) =>
      folder.with("decks", 5)
    )
      .apply("public")
      .create();

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

    const notAccessibleClassroom = await ClassroomFactory.with(
      "rootFolder",
      1,
      (folder) => folder.with("decks", 5)
    )
      .apply("private")
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
