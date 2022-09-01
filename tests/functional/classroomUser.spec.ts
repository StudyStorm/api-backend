/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import { UserFactory } from "Database/factories/UserFactory";
import {
  ClassroomAccessRight,
  ClassroomVisibility,
} from "App/Models/Classroom";

test.group("Classrooms & Users", async (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("get all users from classroom", async ({ client }) => {
    const users = await UserFactory.merge({ isEmailVerified: true }).createMany(
      10
    );
    const classroom = await users[0].related("classrooms").create(
      {
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      },
      { access_right: ClassroomAccessRight.OWNER }
    );

    const response = await client
      .get(`v1/classrooms/${classroom.id}/users`)
      .loginAs(users[0]);

    response.assertStatus(200);
    response.assertBodyContains([]);
  });

  test("get 403 error when retreive users from classroom", async ({
    client,
  }) => {
    const users = await UserFactory.merge({ isEmailVerified: true }).createMany(
      10
    );
    const classroom = await users[0].related("classrooms").create(
      {
        name: "Test Classroom",
        visibility: ClassroomVisibility.PRIVATE,
      },
      { access_right: ClassroomAccessRight.OWNER }
    );

    const response = await client
      .get(`v1/classrooms/${classroom.id}/users`)
      .loginAs(users[1]); // User 1 is not added in the classroom

    response.assertStatus(403);
  });

  test("successfully add user to classroom", async ({ client }) => {
    const users = await UserFactory.merge({ isEmailVerified: true }).createMany(
      10
    );
    const classroom = await users[0].related("classrooms").create(
      {
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      },
      { access_right: ClassroomAccessRight.OWNER }
    );

    const response = await client
      .post(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: users[1].email,
        accessRight: ClassroomAccessRight.RW,
      })
      .loginAs(users[0]);

    response.assertStatus(201);
    response.assertBodyContains({
      message: "User added successfully to classroom",
    });
  });

  test("get 400 error when adding existing user to classroom", async ({
    client,
  }) => {
    const users = await UserFactory.merge({ isEmailVerified: true }).createMany(
      10
    );
    const classroom = await users[0].related("classrooms").create(
      {
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      },
      { access_right: ClassroomAccessRight.OWNER }
    );

    const response = await client
      .post(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: users[0].email,
        accessRight: ClassroomAccessRight.RW,
      })
      .loginAs(users[0]);

    response.assertStatus(400);
    response.assertBodyContains({
      message: "User is already in the classroom",
    });
  });

  test("successfully update an user rights for a classroom", async ({
    client,
  }) => {
    const users = await UserFactory.merge({ isEmailVerified: true }).createMany(
      10
    );
    const classroom = await users[0].related("classrooms").create(
      {
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      },
      { access_right: ClassroomAccessRight.OWNER }
    );

    await client
      .post(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: users[1].email,
        accessRight: ClassroomAccessRight.RW,
      })
      .loginAs(users[0]);

    const response = await client
      .patch(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: users[1].email,
        accessRight: ClassroomAccessRight.RWD,
      })
      .loginAs(users[0]);

    response.assertStatus(200);
    response.assertBodyContains({
      message: "User updated successfully",
    });
  });

  test("successfully delete an user from classroom", async ({ client }) => {
    const users = await UserFactory.merge({ isEmailVerified: true }).createMany(
      10
    );
    const classroom = await users[0].related("classrooms").create(
      {
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      },
      { access_right: ClassroomAccessRight.OWNER }
    );

    await client
      .post(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: users[1].email,
        accessRight: ClassroomAccessRight.RW,
      })
      .loginAs(users[0]);

    const response = await client
      .delete(`v1/classrooms/users`)
      .json({
        classroomId: classroom.id,
        email: users[1].email,
      })
      .loginAs(users[0]);

    response.assertStatus(200);
    response.assertBodyContains({
      message: "User deleted successfully to classroom",
    });
  });
});
