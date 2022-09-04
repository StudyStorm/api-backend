import { test } from "@japa/runner";
import Mail from "@ioc:Adonis/Addons/Mail";
import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories/UserFactory";
import { EmailChangeToken } from "App/core/UserToken";

test.group("ResetEmail", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should change email", async ({ client, assert }) => {
    const mailer = Mail.fake();
    const user = await UserFactory.apply("verified").create();
    const newEmail = "new-email@email.com";
    const response = await client
      .patch("v1/profile/reset-email")
      .json({
        email: newEmail,
      })
      .loginAs(user);
    response.assertStatus(200);
    const mail = mailer.find((mail) => {
      return mail.subject === "Change your email";
    });
    assert.exists(mail);
    assert.equal(mail!.to?.[0].address, newEmail);
    const match = mail?.html?.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/);
    const key = new URL(match?.[2] ?? "").searchParams.get("key");
    assert.exists(key);
    assert.exists(EmailChangeToken.decryptToken(key!));
    Mail.restore();

    const response2 = await client.post("v1/reset-email").json({ key });
    response2.assertStatus(200);

    await user.refresh();

    assert.equal(user.email, newEmail);
  });
});
