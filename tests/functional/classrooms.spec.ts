/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { test } from "@japa/runner";
import Database from "@ioc:Adonis/Lucid/Database";
import Classroom, {
  ClassroomAccessRight,
  ClassroomVisibility,
} from "App/Models/Classroom";
import User from "App/Models/User";
import Folder from "App/Models/Folder";

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

  test("receive 404 code because not authorized", async ({ client }) => {
    const response = await client.get("v1/classrooms");

    response.assertStatus(401);
    response.assertBodyContains({
      errors: [{ message: "E_UNAUTHORIZED_ACCESS: Unauthorized access" }],
    });
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

  test("receive 404 code for bad queries", async ({ client }) => {
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

  test("successfully create a classroom", async ({ client }) => {
    const user = await User.query().where("is_email_verified", true).first();
    const response = await client
      .post("v1/classrooms")
      .json({
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      })
      .loginAs(user!);

    response.assertStatus(201);
    response.assertBodyContains({ message: "Classroom created successfully" });
  });

  test("receive 422 for creating a classroom because it already exists", async ({
    client,
  }) => {
    const user = await User.query()
      .where("is_email_verified", true)
      .firstOrFail();

    const classroom = await user.related("classrooms").create(
      {
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      },
      { access_right: ClassroomAccessRight.OWNER }
    );

    classroom.related("rootFolder").create({ name: "root" });

    const response = await client
      .post("v1/classrooms")
      .json({
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      })
      .loginAs(user!);

    response.assertStatus(422);
    response.assertBodyContains({ errors: [] });
  });

  test("get a public classroom by its uuid", async ({ client }) => {
    const user = await User.query().where("is_email_verified", true).first();
    const classroom = await Classroom.query()
      .where("visibility", ClassroomVisibility.PUBLIC)
      .first();

    const response = await client
      .get(`v1/classrooms/${classroom!.id}`)
      .loginAs(user!);

    response.assertStatus(200);
    response.assertBodyContains({
      id: classroom!.id,
      name: classroom!.name,
      visibility: classroom!.visibility,
    });
  });

  test("received a 403 error when not allowed to access the classroom", async ({
    assert,
    client,
  }) => {
    const user = await User.query().where("is_email_verified", true).first();
    const classroom = await Classroom.query()
      .where("visibility", ClassroomVisibility.PRIVATE)
      .join("user_classrooms", "user_classrooms.classroom_id", "classrooms.id")
      .where("user_classrooms.user_id", "!=", user!.id)
      .first();

    assert.exists(classroom);
    console.log("classroom", classroom?.toJSON());

    const response = await client
      .get(`v1/classrooms/${classroom!.id}`)
      .loginAs(user!);

    response.assertStatus(403);
  });

  test("successfully update my classroom", async ({ client }) => {
    const user = await User.query().where("is_email_verified", true).first();

    await client
      .post("v1/classrooms")
      .json({
        name: "Test Classroom",
        visibility: ClassroomVisibility.PUBLIC,
      })
      .loginAs(user!);

    const classroom = await Classroom.query()
      .where("name", "Test Classroom")
      .first();

    const response = await client
      .patch(`v1/classrooms/${classroom!.id}`)
      .json({
        name: "Test Classroom Updated",
      })
      .loginAs(user!);

    response.assertStatus(200);
    response.assertBodyContains({
      id: classroom!.id,
      name: "Test Classroom Updated",
      visibility: classroom!.visibility,
    });
  });

  test("successfully delete a classroom", async ({ client }) => {
    const user = await User.query().where("is_email_verified", true).first();

    await client
      .post("v1/classrooms")
      .json({
        name: "Test Classroom",
        visibility: ClassroomVisibility.PRIVATE,
      })
      .loginAs(user!);

    const classroom = await Classroom.findBy("name", "Test Classroom");

    const response = await client
      .delete(`v1/classrooms/${classroom!.id}`)
      .loginAs(user!);

    response.assertStatus(200);
    response.assertBodyContains({ message: "Classroom deleted successfully" });
  });
});
