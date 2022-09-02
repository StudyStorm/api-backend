import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import { UserFactory } from "Database/factories/UserFactory";

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
    const user = await UserFactory.apply("verified").create();
    const response = await client.get("v1/profile").loginAs(user);

    response.assertBodyContains({
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
    });
    response.assertStatus(200);
  });

  test("Should update user profile", async ({ client }) => {
    const user = await UserFactory.apply("verified").create();

    const response = await client
      .patch("v1/profile")
      .json({
        id: "not-a-uuid",
        firstName: "Testing",
        lastName: "Patch",
        notExisting: "This should not be updated",
      })
      .loginAs(user);

    response.assertStatus(200);
    response.assertBodyContains({
      id: user.id,
      first_name: "Testing",
      last_name: "Patch",
      email: user.email,
    });
  });

  test("Should delete user account", async ({ client, assert }) => {
    const user = await UserFactory.apply("verified").create();
    const response = await client.delete("v1/profile").loginAs(user);
    response.assertStatus(200);
    assert.isNull(await User.find(user.id));
  });
});
