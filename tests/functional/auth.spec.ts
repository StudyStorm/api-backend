import { test } from "@japa/runner";
import Mail from "@ioc:Adonis/Addons/Mail";
import Database from "@ioc:Adonis/Lucid/Database";
import Route from "@ioc:Adonis/Core/Route";
import { UserFactory } from "Database/factories/UserFactory";
import Hash from "@ioc:Adonis/Core/Hash";
import { PasswordResetToken, VerifyToken } from "App/core/UserToken";

test.group("Auth", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });
  test("should got an 403 error if not verified when login", async ({
    client,
  }) => {
    const user = await UserFactory.apply("unverified").make();
    const password = user.password; // save non-hashed password for later use
    await user.save();
    const response = await client.post("v1/login").json({
      email: user.email,
      password,
    });
    response.assertStatus(403);
    response.assertBodyContains({
      message: "User is not verified",
      resendToken: String,
    });
  });

  test("should got an 403 error if not verified", async ({ client }) => {
    const user = await UserFactory.apply("unverified").create();
    const response = await client.get("v1/profile").loginAs(user);
    response.assertStatus(403);
    response.assertBodyContains({
      message: "User is not verified",
      resendToken: String,
    });
  });

  test("mail sent when registering user", async ({ assert, client }) => {
    const mailer = Mail.fake();

    await client.post("v1/register").json({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
    });

    const mail = mailer.find((mail) => {
      return mail.subject === "Verify your email";
    });
    assert.exists(mail);
    const match = mail?.html?.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/);
    const key = new URL(match?.[2] ?? "").searchParams.get("key");
    assert.exists(key);
    assert.exists(VerifyToken.decryptToken(key!));

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

    response.assertStatus(400);
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
        qs: { key: VerifyToken.createToken(user) },
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
        qs: { key: VerifyToken.createToken(user) },
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
        qs: { key: VerifyToken.createToken(user, -1) },
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

    const mail = mailer.find((mail) => {
      return mail.subject === "Reset your password";
    });
    assert.exists(mail);
    const match = mail?.html?.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/);
    const key = new URL(match?.[2] ?? "").searchParams.get("key");
    assert.exists(key);
    assert.exists(PasswordResetToken.decryptToken(key!));

    Mail.restore();
  });

  test("should reset password", async ({ client, assert }) => {
    const user = await UserFactory.apply("verified").create();
    const key = PasswordResetToken.createToken(user);
    const response = await client.post("v1/reset-password").json({
      key,
      password: "new password",
    });
    response.assertStatus(200);
    response.assertBody({ message: "Password successfully reset" });
    await user.refresh();
    assert.isTrue(await Hash.verify(user.password, "new password"));
  });

  test("should not reset password if already changed", async ({ client }) => {
    const user = await UserFactory.apply("verified").create();
    const key = PasswordResetToken.createToken(user);
    await client.post("v1/reset-password").json({
      key,
      password: "new password",
    });
    const response = await client.post("v1/reset-password").json({
      key,
      password: "new password",
    });
    response.assertStatus(401);
    response.assertBody({ message: "Invalid key" });
  });

  test("should get user email", async ({ client }) => {
    const user = await UserFactory.apply("verified").create();
    const key = PasswordResetToken.createToken(user);
    const response = await client.get("v1/reset-password").qs({
      key,
    });
    response.assertStatus(200);
    response.assertBody({ email: user.email });
  });

  test("should not get user email if invalid key", async ({ client }) => {
    const user = await UserFactory.apply("verified").create();
    const key = PasswordResetToken.createToken(user);
    await user.merge({ password: "new password" }).save();
    const response = await client.get("v1/reset-password").qs({
      key,
    });
    response.assertStatus(401);
    response.assertBody({ message: "Invalid key" });
  });

  test("should resent verification email", async ({ client, assert }) => {
    const mailer = Mail.fake();
    const user = await UserFactory.apply("unverified").create();
    const { resend_token } = (
      await client.get("v1/profile").loginAs(user)
    ).body();
    assert.exists(resend_token);
    const response = await client.post("v1/resend").json({
      key: resend_token,
    });
    response.assertStatus(200);
    const mail = mailer.find((mail) => {
      return mail.subject === "Verify your email";
    });
    assert.exists(mail);
    const match = mail?.html?.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/);
    const key = new URL(match?.[2] ?? "").searchParams.get("key");
    assert.exists(key);
    assert.exists(VerifyToken.decryptToken(key!));
    Mail.restore();
  });
});
