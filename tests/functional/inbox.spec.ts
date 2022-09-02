import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { DeckFactory } from "Database/factories/DeckFactory";
import { ReportFactory } from "Database/factories/ReportFactory";
import { UserFactory } from "Database/factories/UserFactory";
import Report from "App/Models/Report";

test.group("Inbox", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("it should be able to list all the messages", async ({ client }) => {
    await ReportFactory.with("card", 5, (card) => {
      card.with("deck", 1, (deck) => {
        deck.with("creator", 1, (user) => {
          user.apply("verified");
        });
      });
    });
    const deck = await DeckFactory.with("creator", 1, (user) => {
      user.apply("verified");
    })
      .with("cards", 5, (card) => {
        card.with("reports", 5, (report) =>
          report.with("author", 1, (user) => {
            user.apply("verified");
          })
        );
      })
      .create();
    const user = deck.creator;
    const response = await client.get("v1/inbox").loginAs(user);
    response.assertStatus(200);
    response.assertBodyContains({
      meta: {
        total: 25,
      },
      data: [],
    });
  });

  test("it should be able to get a message", async ({ client }) => {
    const report = await ReportFactory.with("card", 5, (card) => {
      card.with("deck", 1, (deck) => {
        deck.with("creator", 1, (user) => {
          user.apply("verified");
        });
      });
    }).create();
    const user = report.card.deck.creator;
    const response = await client.get(`v1/inbox/${report.id}`).loginAs(user);
    response.assertStatus(200);
    response.assertBodyContains({});
  });
  test("it should not be able to get a message when not allowed", async ({
    client,
  }) => {
    const report = await ReportFactory.with("card", 5, (card) => {
      card.with("deck", 1, (deck) => {
        deck.with("creator", 1, (user) => {
          user.apply("verified");
        });
      });
    }).create();
    const user = await UserFactory.apply("verified").create();
    const response = await client.get(`v1/inbox/${report.id}`).loginAs(user);
    response.assertStatus(403);
  });

  test("it should be able to mark a message as read", async ({
    client,
    assert,
  }) => {
    const report = await ReportFactory.apply("unread")
      .with("card", 5, (card) => {
        card.with("deck", 1, (deck) => {
          deck.with("creator", 1, (user) => {
            user.apply("verified");
          });
        });
      })
      .create();
    const user = report.card.deck.creator;
    const response = await client
      .patch(`v1/inbox/${report.id}`)
      .json({
        isRead: true,
      })
      .loginAs(user);
    response.assertStatus(200);
    await report.refresh();
    assert.isTrue(report.isRead);
  });

  test("it should be able to delete a message", async ({ client, assert }) => {
    const report = await ReportFactory.with("card", 5, (card) => {
      card.with("deck", 1, (deck) => {
        deck.with("creator", 1, (user) => {
          user.apply("verified");
        });
      });
    }).create();
    const user = report.card.deck.creator;
    const response = await client.delete(`v1/inbox/${report.id}`).loginAs(user);
    response.assertStatus(200);
    assert.isNull(await Report.find(report.id));
  });

  test("it should not be able to delete a message when not allowed", async ({
    client,
    assert,
  }) => {
    const report = await ReportFactory.with("card", 5, (card) => {
      card.with("deck", 1, (deck) => {
        deck.with("creator", 1, (user) => {
          user.apply("verified");
        });
      });
    }).create();
    const user = await UserFactory.apply("verified").create();
    const response = await client.delete(`v1/inbox/${report.id}`).loginAs(user);
    response.assertStatus(403);
    assert.isNotNull(await Report.find(report.id));
  });
});
