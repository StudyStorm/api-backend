import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";

test.group("Profile", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("Should fail if user  is not logged in", async ({ client }) => {
    const response = await client.get("v1/profile");
    response.assertStatus(401);
  });

  test("Retrieve connected user's profile", async ({ client }) => {
    await User.create({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
      isEmailVerified: true,
    });

    const login = await client.post("v1/login").json({
      email: "test@studystorm.net",
      password: "test123",
    });

    const response = await client.get("v1/profile").session(login.session());

    response.assertBodyContains({
      email: "test@studystorm.net",
      first_name: "Test",
      last_name: "User",
    });
    response.assertStatus(200);
  });
});
