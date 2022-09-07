import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Folder from "App/Models/Folder";
import FolderCreationSchema from "App/Schemas/FolderCreationSchema";
import DeckCreationSchema from "App/Schemas/DeckCreationSchema";
import FolderUpdateSchema from "App/Schemas/FolderUpdateSchema";

export default class FoldersController {
  /**
   * Get Folder metadata and contents
   * @param params
   * @param response
   */
  public async show({ params, bouncer, auth }: HttpContextContract) {
    const { id } = params;
    const preTestFolder = await Folder.findOrFail(id);
    await bouncer
      .with("FolderPolicy")
      .authorize("read", preTestFolder, bouncer);

    const folder = await Folder.query()
      .where("id", id)
      .preload("children")
      .preload("decks", (query) =>
        query.withScopes((scopes) => scopes.withVotes()).preload("creator")
      )
      .preload("creator")
      .preload("classroom", (query) =>
        query.withScopes((scopes) => scopes.getPermissions(auth.user))
      )
      .firstOrFail();
    folder.$extras.path = (
      await folder.getDescendantFolders().select("id", "name").exec()
    ).reverse();
    return folder;
  }

  /**
   * Create a subfolder
   * @param request
   */
  public async create({ request, auth, bouncer }: HttpContextContract) {
    const { id } = request.params();
    const folder = await Folder.findOrFail(id);
    await bouncer.with("FolderPolicy").authorize("write", folder, bouncer);
    const payload = await request.validate({ schema: FolderCreationSchema });
    return folder.related("children").create({
      ...payload,
      creatorId: auth.user!.id,
      classroomId: folder.classroomId,
    });
  }

  public async createDeck({
    params,
    request,
    auth,
    bouncer,
  }: HttpContextContract) {
    const { id } = params;
    const folder = await Folder.findOrFail(id);
    await bouncer.with("FolderPolicy").authorize("write", folder, bouncer);
    const payload = await request.validate({ schema: DeckCreationSchema });
    return folder.related("decks").create({
      ...payload,
      creatorId: auth.user!.id,
    });
  }

  public async update({
    params,
    request,
    bouncer,
    response,
  }: HttpContextContract) {
    const { id } = params;
    const folder = await Folder.findOrFail(id);
    await bouncer.with("FolderPolicy").authorize("write", folder, bouncer);
    const payload = await request.validate({ schema: FolderUpdateSchema });

    if (payload.parentId) {
      const newParent = await Folder.findOrFail(payload.parentId);
      if (newParent.classroomId !== folder.classroomId) {
        return response.forbidden({
          message: "Cannot move folder to another classroom",
        });
      }
    }

    return folder.merge(payload).save();
  }

  public async destroy({ params, response, bouncer }: HttpContextContract) {
    const { id } = params;
    const folder = await Folder.findOrFail(id);
    if (folder.parentId === null) {
      return response.badRequest({ message: "Cannot delete root folder" });
    }
    await bouncer.with("FolderPolicy").authorize("delete", folder, bouncer);
    await folder.delete();
    return response.ok({ message: "Folder deleted successfully" });
  }
}
