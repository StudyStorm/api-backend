import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Deck from "App/Models/Deck";
import DecksUpdateSchema from "App/Schemas/DecksUpdateSchema";

export default class DecksController {
  /**
   * Get all the decks accessible by the user
   */
  public async index({ request, response }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);
    const search = request.input("search", "");

    const decks = await Deck.query()
      .where("name", "like", `%${search}%`)
      .paginate(page, limit);

    return response.ok(decks);
  }

  /**
   * Get the specified deck informations and cards with the
   */
  public async show({ request, response }: HttpContextContract) {
    const deckId = request.param("id");
    const deck = await Deck.findOrFail(deckId);

    return response.ok(deck);
  }

  /**
   * Update the specified deck
   */
  public async update({ request, response }: HttpContextContract) {
    const deckId = request.param("id");

    const deck = await Deck.findOrFail(deckId);

    const payload = await request.validate({
      schema: DecksUpdateSchema,
    });

    deck.merge(payload).save();

    // patch the deck with the id
  }

  /**
   * Delete the specified deck
   */
  public async destroy() {
    // delete the deck with the id
  }

  /**
   * Add a new card to the deck
   */
  public async addCard() {
    //
  }
}
