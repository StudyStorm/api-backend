import { BasePolicy } from "@ioc:Adonis/Addons/Bouncer";
import User from "App/Models/User";
import Classroom, {
  ClassroomAccessRight,
  ClassroomVisibility,
} from "App/Models/Classroom";

export default class ClassroomPolicy extends BasePolicy {
  public async view(user: User, classroom: Classroom) {
    if (classroom.visibility === ClassroomVisibility.PUBLIC) return true;
    return !!(await classroom
      .related("users")
      .query()
      .where("user_id", user.id)
      .first());
  }
  public async owner(user: User, classroom: Classroom) {
    return !!(await classroom
      .related("users")
      .query()
      .where("user_id", user.id)
      .where("access_right", ClassroomAccessRight.OWNER)
      .first());
  }
}
