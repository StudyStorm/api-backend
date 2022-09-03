import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories/UserFactory";
import { ClassroomFactory } from "Database/factories/ClassroomFactory";
import { ClassroomAccessRight } from "App/Models/Classroom";

test.group("Folders", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("get folder content for public classroom", async ({ client }) => {
    const user = await UserFactory.apply("verified").create();
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("public")
      .create();
    const rootFolder = classroom.rootFolder;
    const response = await client
      .get(`v1/folders/${rootFolder.id}`)
      .loginAs(user);
    response.assertStatus(200);
    response.assertBodyContains({});
  });

  test("cannot get folder content of private folder without right", async ({
    client,
  }) => {
    const user = await UserFactory.apply("verified").create();
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .create();
    const rootFolder = classroom.rootFolder;
    const response = await client
      .get(`v1/folders/${rootFolder.id}`)
      .loginAs(user);
    response.assertStatus(403);
  });

  test("can get folder content of private folder with right", async ({
    client,
  }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.OWNER,
        });
      })
      .create();
    const rootFolder = classroom.rootFolder;
    const user = classroom.users[0];
    const response = await client
      .get(`v1/folders/${rootFolder.id}`)
      .loginAs(user);
    response.assertStatus(200);
    response.assertBodyContains({});
  });

  test("can create folder in folder", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.RW,
        });
      })
      .create();
    const rootFolder = classroom.rootFolder;
    const user = classroom.users[0];
    const response = await client
      .post(`v1/folders/${rootFolder.id}`)
      .loginAs(user)
      .json({
        name: "test",
      });
    response.assertStatus(200);
    response.assertBodyContains({});
  });

  test("cannot create folder in folder without right", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.R,
        });
      })
      .create();
    const rootFolder = classroom.rootFolder;
    const user = classroom.users[0];
    const response = await client
      .post(`v1/folders/${rootFolder.id}`)
      .loginAs(user)
      .json({
        name: "test",
      });
    response.assertStatus(403);
  });

  test("canot delete root folder", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.RWD,
        });
      })
      .create();
    const rootFolder = classroom.rootFolder;
    const user = classroom.users[0];
    const response = await client
      .delete(`v1/folders/${rootFolder.id}`)
      .loginAs(user);
    response.assertStatus(400);
  });

  test("canot delete folder when not allowed to delete", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.RW,
        });
      })
      .create();
    const subFolder = await classroom.rootFolder.related("children").create({
      name: "subFolder",
      classroomId: classroom.id,
    });
    const user = classroom.users[0];
    const response = await client
      .delete(`v1/folders/${subFolder.id}`)
      .loginAs(user);
    response.assertStatus(403);
  });

  test("can delete folder when allowed to delete", async ({
    client,
    assert,
  }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.RWD,
        });
      })
      .create();
    const subFolder = await classroom.rootFolder.related("children").create({
      name: "subFolder",
      classroomId: classroom.id,
    });
    const user = classroom.users[0];
    const response = await client
      .delete(`v1/folders/${subFolder.id}`)
      .loginAs(user);
    response.assertStatus(200);
    assert.isNull(
      await classroom.rootFolder.related("children").query().first()
    );
  });

  test("can rename folder", async ({ client, assert }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.RW,
        });
      })
      .create();
    const subFolder = await classroom.rootFolder.related("children").create({
      name: "subFolder",
      classroomId: classroom.id,
    });
    const user = classroom.users[0];
    const response = await client
      .patch(`v1/folders/${subFolder.id}`)
      .loginAs(user)
      .json({
        name: "newName",
      });
    response.assertStatus(200);
    assert.equal(
      (await classroom.rootFolder.related("children").query().first())?.name,
      "newName"
    );
  });

  test("canot rename folder when not allowed to rename", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.R,
        });
      })
      .create();
    const subFolder = await classroom.rootFolder.related("children").create({
      name: "subFolder",
      classroomId: classroom.id,
    });
    const user = classroom.users[0];
    const response = await client
      .patch(`v1/folders/${subFolder.id}`)
      .loginAs(user)
      .json({
        name: "newName",
      });
    response.assertStatus(403);
  });

  test("can create a deck in a folder", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.RW,
        });
      })
      .create();
    const rootFolder = classroom.rootFolder;
    const user = classroom.users[0];
    const response = await client
      .post(`v1/folders/${rootFolder.id}/decks`)
      .loginAs(user)
      .json({
        name: "test",
      });
    response.assertStatus(200);
    response.assertBodyContains({});
  });

  test("canot create a deck in a folder without right", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 1, (user) => {
        user.apply("verified").pivotAttributes({
          access_right: ClassroomAccessRight.R,
        });
      })
      .create();
    const rootFolder = classroom.rootFolder;
    const user = classroom.users[0];
    const response = await client
      .post(`v1/folders/${rootFolder.id}/decks`)
      .loginAs(user)
      .json({
        name: "test",
      });
    response.assertStatus(403);
  });
});
