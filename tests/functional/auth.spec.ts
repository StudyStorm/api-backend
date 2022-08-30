import { test } from "@japa/runner";
import Mail from "@ioc:Adonis/Addons/Mail";
import User from "App/Models/User";
import Database from "@ioc:Adonis/Lucid/Database";
import Encryption from "@ioc:Adonis/Core/Encryption";
import Route from "@ioc:Adonis/Core/Route";

test.group("Auth", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });
  test("mail sent when registering user", async ({ assert, client }) => {
    const mailer = Mail.fake();

    await client.post("v1/register").json({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
    });

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject === "Verify your email";
      })
    );

    Mail.restore();
  });

  test("successful login", async ({ assert, client }) => {
    const user = await User.create({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: true,
    });

    assert.exists(user);

    const response = await client.post("v1/login").json({
      email: "test@studystorm.net",
      password: "test123",
    });

    response.assertStatus(201);
    response.assertBody({
      message: "User successfully logged in",
    });
  });

  test("verifyEmail makes new user email as verified", async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
    });

    const verifyEmailUrl = Route.makeUrl(
      "verifyEmail",
      {},
      {
        qs: { key: Encryption.encrypt(user.id, "24 hours") },
      }
    );
    assert.exists(user);

    const response = await client.get(verifyEmailUrl);
    response.assertStatus(200);

    const verifiedUser = await User.find(user.id);
    assert.exists(verifiedUser);
    assert.isTrue(verifiedUser?.isEmailVerified);
  });

  test("verifyEmail checks if the mail is already verified", async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: true,
    });

    const verifyEmailUrl = Route.makeUrl(
      "verifyEmail",
      {},
      {
        qs: { key: Encryption.encrypt(user.id, "24 hours") },
      }
    );

    assert.exists(user);

    const response = await client.get(verifyEmailUrl);
    response.assertStatus(400);
    response.assertBody({ message: "Email already verified" });
  });
});
