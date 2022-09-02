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

    const classrooms = await Classroom.query()
      .withScopes((scopes) => scopes.canRead(auth.user))
      .preload("rootFolder")
      .paginate(page, limit);

    if (classrooms.isEmpty) {
      return response.status(404).json({
        message: "No classrooms found",
      });
    }

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

  public async show({ params, bouncer }: HttpContextContract) {
    const classroom = await Classroom.findOrFail(params.id);
    await bouncer.with("ClassroomPolicy").authorize("read", classroom);
    await classroom.load("rootFolder");
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

  public async users({ response, bouncer, params }: HttpContextContract) {
    const classroom = await Classroom.findOrFail(params.id);
    await bouncer.with("ClassroomPolicy").authorize("read", classroom);

    await classroom.load("users");
    return response.ok(classroom.users);
  }

  public async addUser({ bouncer, response, request }: HttpContextContract) {
    const payload = await request.validate({ schema: ClassroomUserSchema });
    const classroom = await Classroom.findOrFail(payload.classroomId);

    await bouncer.with("ClassroomPolicy").authorize("owner", classroom);

    const user = await User.findByOrFail("email", payload.email);

    await classroom.load("users");
    if (classroom.users.map((u) => u.id).includes(user.id)) {
      return response.badRequest({
        message: "User is already in the classroom",
      });
    }
    await classroom.related("users").attach({
      [user.id]: {
        access_right: ClassroomAccessRight.RW,
      },
    });

    return response.created({
      message: "User added successfully to classroom",
    });
  }

  public async updateUser({ bouncer, response, request }: HttpContextContract) {
    const payload = await request.validate({ schema: ClassroomUserSchema });
    const classroom = await Classroom.findOrFail(payload.classroomId);

    await bouncer.with("ClassroomPolicy").authorize("owner", classroom);

    const user = await User.findByOrFail("email", payload.email);

    await classroom
      .related("users")
      .pivotQuery()
      .wherePivot("user_id", user.id)
      .update("access_right", payload.accessRight);

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
      return response.badRequest({
        message: "User is not in the classroom",
      });
    }
    await classroom.related("users").detach([user.id]);

    return response.ok({
      message: "User deleted successfully to classroom",
    });
  }
}
