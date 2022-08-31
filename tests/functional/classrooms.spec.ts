/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import Classroom from "App/Models/Classroom";
import User from "App/Models/User";

test.group("Classrooms", async (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });
  test("get all classrooms", async ({ client }) => {
    const user = await User.query().where("is_email_verified", true).first();
    const response = await client.get("v1/classrooms").loginAs(user!);

    response.assertStatus(200);
    response.assertBodyContains({ meta: {}, data: [] });
  });

  test("get first page of 2 classrooms", async ({ client }) => {
    const user = await User.query().where("is_email_verified", true).first();
    const response = await client
      .get("v1/classrooms?page=1&limit=2")
      .loginAs(user!);

    response.assertStatus(200);
    response.assertBodyContains({
      meta: { per_page: 2, current_page: 1 },
      data: [{}, {}],
    });
  });

  test("get no classrooms", async ({ client }) => {
    const user = await User.query().where("is_email_verified", true).first();
    const classrooms = await Classroom.all();

    const response = await client
      .get(`v1/classrooms?page=${classrooms.length}&limit=${classrooms.length}`)
      .loginAs(user!);

    response.assertStatus(404);
    response.assertBodyContains({
      message: "No classrooms found",
    });
  });
});
