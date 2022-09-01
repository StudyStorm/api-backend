/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories/UserFactory";
import { ClassroomAccessRight } from "App/Models/Classroom";
import { ClassroomFactory } from "Database/factories/ClassroomFactory";

test.group("Classrooms & Users", async (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("get all users from public classroom", async ({ client }) => {
    const user = await UserFactory.apply("verified").create();
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("public")
      .with("users", 10, (users) => {
        users
          .apply("verified")
          .pivotAttributes({ access_right: ClassroomAccessRight.OWNER });
      })
      .create();

    const response = await client
      .get(`v1/classrooms/${classroom.id}/users`)
      .loginAs(user);

    response.assertStatus(200);
    response.assertBodyContains([]);
  });

  test("get all users from private classroom", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 10, (users) => {
        users
          .apply("verified")
          .pivotAttributes({ access_right: ClassroomAccessRight.R });
      })
      .create();

    const response = await client
      .get(`v1/classrooms/${classroom.id}/users`)
      .loginAs(classroom.users[0]);

    response.assertStatus(200);
    response.assertBodyContains([]);
  });

  test("get 403 error when retrieve users from private classroom", async ({
    client,
  }) => {
    const user = await UserFactory.apply("verified").create();
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("private")
      .with("users", 10, (users) => {
        users
          .apply("verified")
          .pivotAttributes({ access_right: ClassroomAccessRight.OWNER });
      })
      .create();

    const response = await client
      .get(`v1/classrooms/${classroom.id}/users`)
      .loginAs(user);

    response.assertStatus(403);
  });

  test("successfully add user to classroom", async ({ client }) => {
    const userToAdd = await UserFactory.apply("verified").create();
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("public")
      .with("users", 1, (users) => {
        users
          .apply("verified")
          .pivotAttributes({ access_right: ClassroomAccessRight.OWNER });
      })
      .create();
    const response = await client
      .post(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: userToAdd.email,
        accessRight: ClassroomAccessRight.RW,
      })
      .loginAs(classroom.users[0]);

    response.assertStatus(201);
    response.assertBodyContains({
      message: "User added successfully to classroom",
    });
  });

  test("get 400 error when adding existing user to classroom", async ({
    client,
  }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("public")
      .with("users", 2, (users) => {
        users
          .apply("verified")
          .pivotAttributes({ access_right: ClassroomAccessRight.OWNER });
      })
      .create();

    const response = await client
      .post(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: classroom.users[0].email,
        accessRight: ClassroomAccessRight.RW,
      })
      .loginAs(classroom.users[1]);

    response.assertStatus(400);
    response.assertBodyContains({
      message: "User is already in the classroom",
    });
  });

  test("successfully update an user rights for a classroom", async ({
    client,
  }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("public")
      .with("users", 2, (users) => {
        users
          .apply("verified")
          .pivotAttributes({ access_right: ClassroomAccessRight.OWNER });
      })
      .create();

    const response = await client
      .patch(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: classroom.users[1].email,
        accessRight: ClassroomAccessRight.RWD,
      })
      .loginAs(classroom.users[0]);

    response.assertStatus(200);
    response.assertBodyContains({
      message: "User updated successfully",
    });
  });

  test("successfully delete an user from classroom", async ({ client }) => {
    const classroom = await ClassroomFactory.with("rootFolder")
      .apply("public")
      .with("users", 2, (users) => {
        users
          .apply("verified")
          .pivotAttributes({ access_right: ClassroomAccessRight.OWNER });
      })
      .create();

    const response = await client
      .delete(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: classroom.users[1].email,
      })
      .loginAs(classroom.users[0]);

    response.assertStatus(200);
    response.assertBodyContains({
      message: "User deleted successfully to classroom",
    });
  });
});
