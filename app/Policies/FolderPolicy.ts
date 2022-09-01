import { BasePolicy } from "@ioc:Adonis/Addons/Bouncer";
import User from "App/Models/User";
import Folder from "App/Models/Folder";
import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";

export default class FolderPolicy extends BasePolicy {
  public async read(
    _user: User,
    folder: Folder,
    bouncer: HttpContextContract["bouncer"]
  ) {
    await folder.load("classroom");
    return bouncer.with("ClassroomPolicy").allows("read", folder.classroom);
  }
  public async write(
    _user: User,
    folder: Folder,
    bouncer: HttpContextContract["bouncer"]
  ) {
    await folder.load("classroom");
    return bouncer.with("ClassroomPolicy").allows("write", folder.classroom);
  }
  public async delete(
    _user: User,
    folder: Folder,
    bouncer: HttpContextContract["bouncer"]
  ) {
    await folder.load("classroom");
    return bouncer.with("ClassroomPolicy").allows("delete", folder.classroom);
  }
}
