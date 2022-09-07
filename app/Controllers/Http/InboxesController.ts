import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Report from "App/Models/Report";
import { schema } from "@ioc:Adonis/Core/Validator";

export default class InboxesController {
  public async index({ response, request, auth }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);

    const inboxes = await Report.query()
      .withScopes((scopes) => scopes.canRead(auth.user))
      .preload("author")
      .orderBy("is_read")
      .orderBy("created_at")
      .paginate(page, limit);

    return response.ok(inboxes);
  }

  public async show({ params, bouncer }: HttpContextContract) {
    const report = await Report.findOrFail(params.id);
    await bouncer.with("ReportPolicy").authorize("read", report);
    return report;
  }

  public async update({ request, params, bouncer }: HttpContextContract) {
    const report = await Report.findOrFail(params.id);
    await bouncer.with("ReportPolicy").authorize("read", report);
    const payload = await request.validate({
      schema: schema.create({
        isRead: schema.boolean(),
      }),
    });
    return report.merge(payload).save();
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    const report = await Report.findOrFail(params.id);
    await bouncer.with("ReportPolicy").authorize("read", report);
    await report.delete();
    return response.ok({ message: "Report deleted successfully" });
  }
}
