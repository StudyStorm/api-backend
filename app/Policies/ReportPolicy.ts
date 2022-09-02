import { BasePolicy } from "@ioc:Adonis/Addons/Bouncer";
import User from "App/Models/User";
import Report from "App/Models/Report";

export default class ReportPolicy extends BasePolicy {
  public async read(user: User, report: Report) {
    return !!(await report
      .related("card")
      .query()
      .whereHas("deck", (deckBuilder) => {
        deckBuilder.where("creator_id", user.id);
      })
      .first());
  }
}
