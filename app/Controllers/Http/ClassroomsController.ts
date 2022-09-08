import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { rules, schema } from "@ioc:Adonis/Core/Validator";
import Classroom, { ClassroomAccessRight } from "App/Models/Classroom";
import User from "App/Models/User";
import ClassroomCreationSchema from "App/Schemas/ClassroomCreationSchema";
import ClassroomUpdateSchema from "App/Schemas/ClassroomUpdateSchema";
import ClassroomUserSchema from "App/Schemas/ClassroomUserSchema";

export default class ClassroomsController {
  public async index({ response, request, auth }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);
    const search = request.input("search", "");

    const classrooms = await Classroom.query()
      .where("name", "ilike", `%${search}%`)
      .orderBy("name")
      .withScopes((scopes) => scopes.canRead(auth.user))
      .withScopes((scopes) => scopes.getPermissions(auth.user))
      .preload("rootFolder")
      .withCount("users", (query) => {
        query.as("nb_members");
      })
      .paginate(page, limit);

    return response.ok(classrooms);
  }

  public async create({ auth, response, request }: HttpContextContract) {
    const payload = await request.validate({ schema: ClassroomCreationSchema });

    const user = auth.user!;
    const classroom = await user
      .related("classrooms")
      .create(payload, { access_right: ClassroomAccessRight.OWNER });
    classroom.related("rootFolder").create({ name: "root" });
    return response.created({ message: "Classroom created successfully" });
  }

  public async show({ params, bouncer, auth }: HttpContextContract) {
    const classroom = await Classroom.query()
      .withScopes((scopes) => scopes.getPermissions(auth.user))
      .where("id", params.id)
      .preload("rootFolder")
      .withCount("users", (query) => {
        query.as("nb_members");
      })
      .firstOrFail();
    await bouncer.with("ClassroomPolicy").authorize("read", classroom);
    return classroom;
  }

  public async update({ request, params, bouncer }: HttpContextContract) {
    const classroom = await Classroom.findOrFail(params.id);

    await bouncer.with("ClassroomPolicy").authorize("owner", classroom);

    const payload = await request.validate({ schema: ClassroomUpdateSchema });
    classroom.merge(payload);
    await classroom.save();
    return classroom;
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    const classroom = await Classroom.findOrFail(params.id);
    await bouncer.with("ClassroomPolicy").authorize("owner", classroom);
    await classroom.delete();
    return response.ok({ message: "Classroom deleted successfully" });
  }

  public async users({
    request,
    response,
    bouncer,
    params,
  }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);
    const classroom = await Classroom.findOrFail(params.id);
    await bouncer.with("ClassroomPolicy").authorize("read", classroom);
    const users = await User.query()
      .join("user_classrooms", "users.id", "user_classrooms.user_id")
      .where("user_classrooms.classroom_id", classroom.id)
      .select("users.*")
      .select("user_classrooms.access_right")
      .orderBy("first_name")
      .orderBy("last_name")
      .paginate(page, limit);
    return response.ok(users);
  }

  public async addUser({ bouncer, response, request }: HttpContextContract) {
    const payload = await request.validate({ schema: ClassroomUserSchema });
    const classroom = await Classroom.findOrFail(payload.classroomId);

    await bouncer.with("ClassroomPolicy").authorize("owner", classroom);

    const user = await User.findByOrFail("email", payload.email);

    if (
      await classroom
        .related("users")
        .pivotQuery()
        .where("user_id", user.id)
        .first()
    ) {
      return response.unprocessableEntity({
        message: "User is already in the classroom",
      });
    }
    await classroom.related("users").sync(
      {
        [user.id]: {
          access_right: payload.accessRight,
        },
      },
      false
    );

    return response.created({
      message: "User added successfully to classroom",
    });
  }

  public async updateUser({ bouncer, response, request }: HttpContextContract) {
    const payload = await request.validate({ schema: ClassroomUserSchema });
    const classroom = await Classroom.findOrFail(payload.classroomId);

    await bouncer.with("ClassroomPolicy").authorize("owner", classroom);

    const user = await User.findByOrFail("email", payload.email);

    await classroom.related("users").sync(
      {
        [user.id]: {
          access_right: payload.accessRight,
        },
      },
      false
    );

    return response.ok({
      message: "User updated successfully",
    });
  }

  public async removeUser({ bouncer, response, request }: HttpContextContract) {
    const payload = await request.validate({
      schema: schema.create({
        classroomId: schema.string(),
        email: schema.string({ trim: true }, [rules.email()]),
      }),
    });
    const classroom = await Classroom.findOrFail(payload.classroomId);

    await bouncer.with("ClassroomPolicy").authorize("owner", classroom);

    const user = await classroom
      .related("users")
      .query()
      .where("email", payload.email)
      .first();

    if (!user) {
      return response.unprocessableEntity({
        message: "User is not in the classroom",
      });
    }
    await classroom.related("users").detach([user.id]);

    return response.ok({
      message: "User deleted successfully to classroom",
    });
  }
  public async joined({ response, request, auth }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);

    const classrooms = await Classroom.query()
      .orderBy("name")
      .withScopes((scopes) => scopes.joined(auth.user))
      .preload("rootFolder")
      .paginate(page, limit);

    return response.ok(classrooms);
  }

  public async join({ response, params, bouncer, auth }: HttpContextContract) {
    const classroom = await Classroom.findOrFail(params.id);
    await bouncer.with("ClassroomPolicy").authorize("onlyPublic", classroom);

    if (
      await classroom
        .related("users")
        .pivotQuery()
        .where("user_id", auth.user!.id)
        .first()
    ) {
      return response.unprocessableEntity({
        message: "user is already in the classroom",
      });
    }

    await classroom.related("users").sync(
      {
        [auth.user!.id]: {
          access_right: ClassroomAccessRight.SUBSCRIBER,
        },
      },
      false
    );
    return response.ok({ message: "Classroom joined successfully" });
  }

  public async leave({ response, params, auth }: HttpContextContract) {
    const classroom = await Classroom.findOrFail(params.id);
    await classroom.related("users").detach([auth.user!.id]);
    // WARNING: Actually, if the last owner leaves the classroom, the classroom is not deleted

    return response.ok({ message: "Classroom left successfully" });
  }
}
