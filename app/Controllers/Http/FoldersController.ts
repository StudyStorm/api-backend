import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Folder from "App/Models/Folder";

export default class FoldersController {
  public async getDescendants({ params }: HttpContextContract) {
    return Folder.getDescendantFolders(params.id)
      .whereNull("parent_id")
      .first();
  }

  public async getAscendants({ params }: HttpContextContract) {
    return Folder.getAscendantFolders(params.id);
  }
}
