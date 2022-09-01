import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Deck from "App/Models/Deck";

export default class DecksController {
  /**
   * Get all the decks accessible by the user
   */
  public async index({ request, response }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);

    const decks = await Deck.query().paginate(page, limit);

    if (decks.isEmpty) {
      return response.status(404).json({
        message: "No decks found",
      });
    }

    return response.ok(decks);
  }

  /**
   * Create a new card in deck
   */
  public async store() {
    //
  }

  /**
   * Get the specified deck informations and cards with the
   */
  public async show() {
    // return this deck from its id
  }

  /**
   * Update the specified deck
   */
  public async update() {
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
