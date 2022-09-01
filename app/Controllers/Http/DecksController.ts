import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Deck from "App/Models/Deck";
import CardsCreationSchema from "App/Schemas/CardsCreationSchema";
import DecksUpdateSchema from "App/Schemas/DecksUpdateSchema";

export default class DecksController {
  /**
   * Get all the decks accessible by the user
   */
  public async index({ request, response, auth }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);
    const search = request.input("search", "");

    const decks = await Deck.query()
      .withScopes((scopes) => scopes.canRead(auth.user))
      .where("name", "like", `%${search}%`)
      .paginate(page, limit);

    return response.ok(decks);
  }

  /**
   * Get the specified deck informations and cards with the
   */
  public async show({ request, response, bouncer }: HttpContextContract) {
    const deckId = request.param("id");
    const deck = await Deck.findOrFail(deckId);
    await bouncer.with("DeckPolicy").authorize("read", deck, bouncer);

    return response.ok(deck);
  }

  /**
   * Update the specified deck
   */
  public async update({ request, bouncer }: HttpContextContract) {
    const deckId = request.param("id");

    const deck = await Deck.findOrFail(deckId);
    await bouncer.with("DeckPolicy").authorize("write", deck, bouncer);

    const payload = await request.validate({
      schema: DecksUpdateSchema,
    });

    await deck.merge(payload).save();

    // patch the deck with the id
  }

  /**
   * Delete the specified deck
   */
  public async destroy({ request, response, bouncer }: HttpContextContract) {
    const deckId = request.param("id");
    const deck = await Deck.findOrFail(deckId);
    await bouncer.with("DeckPolicy").authorize("delete", deck, bouncer);
    await deck.delete();
    return response.ok({ message: "Deck deleted successfully" });
  }

  /**
   * Add a new card to the deck
   */
  public async addCard({ request, response, bouncer }: HttpContextContract) {
    const { deckId, content } = await request.validate({
      schema: CardsCreationSchema,
    });

    const deck = await Deck.findOrFail(deckId);
    await bouncer.with("DeckPolicy").authorize("write", deck, bouncer);
    const card = await deck.related("cards").create({ content: content });
    return response.created(card);
  }

  // /* Update a new card to the deck */
  // public async updateCard({}: HttpContextContract) {}

  // /* Delete a card from the deck */
  // public async destroyCard({}: HttpContextContract) {}
}
