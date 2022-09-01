import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";

test.group("Profile", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("Should fail if user is not logged in", async ({ client }) => {
    let response = await client.get("v1/profile");
    response.assertStatus(401);

    response = await client.patch("v1/profile");
    response.assertStatus(401);

    response = await client.delete("v1/profile");
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

  test("Should update user profile", async ({ client }) => {
    await User.create({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
    });

    const login = await client.post("v1/login").json({
      email: "test@studystorm.net",
      password: "test123",
    });

    const response = await client
      .patch("v1/profile")
      .json({
        firstName: "Testing",
        lastName: "Patch",
      })
      .session(login.session());

    response.assertStatus(200);
    response.assertBodyContains({
      first_name: "Testing",
      last_name: "Patch",
    });
  });

  test("Should not modifiy unspecified keys", async ({ client }) => {
    await User.create({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
    });

    const login = await client.post("v1/login").json({
      email: "test@studystorm.net",
      password: "test123",
    });

    const response = await client
      .patch("v1/profile")
      .json({
        firstName: "Testing",
        lastName: "Patch",
      })
      .session(login.session());

    response.assertStatus(200);
    response.assertBodyContains({
      first_name: "Testing",
      last_name: "Patch",
      email: "test@studystorm.net",
    });
  });

  test("Should delete user account", async ({ client }) => {
    await User.create({
      email: "test@studystorm.net",
      password: "test123",
      firstName: "Test",
      lastName: "User",
    });

    const login = await client.post("v1/login").json({
      email: "test@studystorm.net",
      password: "test123",
    });

    const response = await client.delete("v1/profile").session(login.session());
    response.assertStatus(200);
  });
});
