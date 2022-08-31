import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Classroom, { AccessRight } from "App/Models/Classroom";
import ClassroomCreationSchema from "App/Schemas/ClassroomCreationSchema";

export default class ClassroomsController {
  public async index({ response, request }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);

    const classrooms = await Classroom.query().paginate(page, limit);

    if (classrooms.isEmpty) {
      return response.status(404).json({
        message: "No classrooms found",
      });
    }

    return response.ok(classrooms);
  }

  public async create({ auth, response, request }: HttpContextContract) {
    const payload = await request.validate({ schema: ClassroomCreationSchema });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const user = auth.user!;
    await user
      .related("classrooms")
      .create(payload, { access_right: AccessRight.OWNER });

    return response.created({ message: "Classroom created successfully" });
  }

  // public async store({}: HttpContextContract) {}

  // public async show({}: HttpContextContract) {}

  // public async edit({}: HttpContextContract) {}

  // public async update({}: HttpContextContract) {}

  // public async destroy({}: HttpContextContract) {}
}
