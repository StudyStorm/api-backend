import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Classroom, { ClassroomAccessRight } from "App/Models/Classroom";
import ClassroomCreationSchema from "App/Schemas/ClassroomCreationSchema";
import ClassroomUpdateSchema from "App/Schemas/ClassroomUpdateSchema";

export default class ClassroomsController {
  public async index({ response, request, auth }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);

    const classrooms = await Classroom.query()
      .withScopes((scopes) => scopes.canRead(auth.user))
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
    await bouncer.with("ClassroomPolicy").authorize("view", classroom);
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
}
