import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Classroom, { AccessRight } from "App/Models/Classroom";
import ClassroomCreationSchema from "App/Schemas/ClassroomCreationSchema";
import Folder from "App/Models/Folder";
import Database from "@ioc:Adonis/Lucid/Database";

export default class ClassroomsController {
  // TODO: Only the members/owners can see a list of private classroom
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

    const user = auth.user!;
    await Database.transaction(async (trx) => {
      const rootFolder = await Folder.createRoot({ client: trx });
      await user
        .useTransaction(trx)
        .related("classrooms")
        .create(
          {
            ...payload,
            rootFolderId: rootFolder.id,
          },
          { access_right: AccessRight.OWNER }
        );
    });
    return response.created({ message: "Classroom created successfully" });
  }

  // TODO: Only the members/owners can see a private classroom
  public async show({ params }: HttpContextContract) {
    return Classroom.findOrFail(params.id);
  }

  // public async edit({}: HttpContextContract) {}

  // TODO: Only the owner can modify the classroom
  public async update({ request, params }: HttpContextContract) {
    const payload = await request.validate({ schema: ClassroomCreationSchema });

    const classroom = await Classroom.findOrFail(params.id);

    classroom.merge(payload);
    await classroom.save();
    return classroom;
  }

  // TODO: Only the owner can delete the classroom
  public async destroy({ params }: HttpContextContract) {
    const classroom = await Classroom.findOrFail(params.id);
    await classroom.delete();
    return classroom;
  }
}
