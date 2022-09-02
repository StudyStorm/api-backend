import { test } from "@japa/runner";
import Mail from "@ioc:Adonis/Addons/Mail";
import Database from "@ioc:Adonis/Lucid/Database";
import Encryption from "@ioc:Adonis/Core/Encryption";
import Route from "@ioc:Adonis/Core/Route";
import { UserFactory } from "Database/factories/UserFactory";
import Hash from "@ioc:Adonis/Core/Hash";

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

  test("successful login", async ({ client }) => {
    const user = await UserFactory.apply("verified").make();
    const password = user.password; // save non-hashed password for later use
    await user.save();
    const response = await client.post("v1/login").json({
      email: user.email,
      password,
    });

    response.assertStatus(200);
    response.assertBody({
      message: "User successfully logged in",
    });
  });

  test("unsuccessful login", async ({ client }) => {
    const user = await UserFactory.apply("verified").create();
    const response = await client.post("v1/login").json({
      email: user.email,
      password: "wrong password",
    });

    response.assertStatus(401);
    response.assertBody({
      message: "Invalid credentials",
    });
  });

  test("verifyEmail makes new user email as verified", async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.apply("unverified").create();

    const verifyEmailUrl = Route.makeUrl(
      "verifyEmail",
      {},
      {
        qs: { key: Encryption.encrypt(user.id, "24 hours") },
      }
    );
    const response = await client.post(verifyEmailUrl);
    response.assertStatus(200);

    await user.refresh();
    assert.isTrue(user.isEmailVerified);
  });

  test("verifyEmail checks if the mail is already verified", async ({
    client,
  }) => {
    const user = await UserFactory.apply("verified").create();

    const verifyEmailUrl = Route.makeUrl(
      "verifyEmail",
      {},
      {
        qs: { key: Encryption.encrypt(user.id, "24 hours") },
      }
    );

    const response = await client.post(verifyEmailUrl);
    response.assertStatus(400);
    response.assertBody({ message: "Email already verified" });
  });

  test("should not work with invalid key", async ({ client }) => {
    const verifyEmailUrl = Route.makeUrl(
      "verifyEmail",
      {},
      {
        qs: { key: "invalid key" },
      }
    );
    const response = await client.post(verifyEmailUrl);
    response.assertStatus(400);
    response.assertBody({ message: "Invalid key" });
  });

  test("should not work with expired key", async ({ client }) => {
    const user = await UserFactory.apply("unverified").create();

    const verifyEmailUrl = Route.makeUrl(
      "verifyEmail",
      {},
      {
        qs: { key: Encryption.encrypt(user.id, "-24 hours") },
      }
    );
    const response = await client.post(verifyEmailUrl);
    response.assertStatus(400);
    response.assertBody({ message: "Invalid key" });
  });

  test("should send reset password email", async ({ client, assert }) => {
    const user = await UserFactory.apply("verified").create();
    const mailer = Mail.fake();
    const response = await client.post("v1/forgot-password").json({
      email: user.email,
    });
    response.assertStatus(200);
    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject === "Reset your password";
      })
    );
    Mail.restore();
  });

  test("should reset password", async ({ client, assert }) => {
    const user = await UserFactory.apply("verified").create();
    const key = Encryption.encrypt(user.id);
    const response = await client.post("v1/reset-password").qs({ key }).json({
      password: "new password",
    });
    response.assertStatus(200);
    response.assertBody({ message: "Password successfully reset" });
    await user.refresh();
    assert.isTrue(await Hash.verify(user.password, "new password"));
  });
});
