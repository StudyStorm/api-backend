import { test } from "@japa/runner";
import Mail from "@ioc:Adonis/Addons/Mail";

test.group("Auth", () => {
  test("mail sent when registering user", async ({ assert, client }) => {
    const mailer = Mail.fake();

    await client.post("api/v1/register").json({
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
});
