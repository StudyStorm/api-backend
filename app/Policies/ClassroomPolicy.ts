import { BasePolicy } from "@ioc:Adonis/Addons/Bouncer";
import User from "App/Models/User";
import Classroom, {
  ClassroomAccessRight,
  ClassroomVisibility,
} from "App/Models/Classroom";

export default class ClassroomPolicy extends BasePolicy {
  public async before(user: User | null) {
    if (user && user.isSuperAdmin) return true;
  }

  public async onlyPublic(_user: User, classroom: Classroom) {
    return classroom.visibility === ClassroomVisibility.PUBLIC;
  }

  public async onlyPrivate(_user: User, classroom: Classroom) {
    return classroom.visibility === ClassroomVisibility.PRIVATE;
  }

  public async read(user: User, classroom: Classroom) {
    if (classroom.visibility === ClassroomVisibility.PUBLIC) return true;
    return !!(await classroom
      ?.related("users")
      .query()
      .where("user_id", user.id)
      .first());
  }

  public async write(user: User, classroom: Classroom) {
    return !!(await classroom
      ?.related("users")
      .query()
      .where("user_id", user.id)
      .andWhere((query) => {
        query
          .where("access_right", ClassroomAccessRight.RW)
          .orWhere("access_right", ClassroomAccessRight.RWD)
          .orWhere("access_right", ClassroomAccessRight.OWNER);
      })
      .first());
  }

  public async delete(user: User, classroom: Classroom) {
    return !!(await classroom
      ?.related("users")
      .query()
      .where("user_id", user.id)
      .andWhere((query) => {
        query
          .where("access_right", ClassroomAccessRight.RWD)
          .orWhere("access_right", ClassroomAccessRight.OWNER);
      })
      .first());
  }

  public async owner(user: User, classroom: Classroom) {
    return !!(await classroom
      .related("users")
      .query()
      .where("user_id", user.id)
      .andWhere("access_right", ClassroomAccessRight.OWNER)
      .first());
  }
}
