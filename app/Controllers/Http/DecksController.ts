import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Card, { CardContent } from "App/Models/Card";
import Deck from "App/Models/Deck";
import Folder from "App/Models/Folder";
import CardsCreationSchema from "App/Schemas/CardsCreationSchema";
import CardsUpdateSchema from "App/Schemas/CardsUpdateSchema";
import DecksUpdateSchema from "App/Schemas/DecksUpdateSchema";
import { schema } from "@ioc:Adonis/Core/Validator";

export default class DecksController {
  /**
   * Get all the decks accessible by the user
   */
  public async index({ request, response, auth }: HttpContextContract) {
    const page = request.input("page", 1);
    const limit = request.input("limit", 10);
    const search = request.input("search", "");
    const orderByTop = request.input("top");

    const decks = await Deck.query()
      .withScopes((scopes) => scopes.canRead(auth.user))
      .withScopes((scopes) => scopes.withVotes())
      .where("name", "ilike", `%${search}%`)
      .preload("creator")
      .if(!!orderByTop, (query) => {
        query.orderBy("votes", "desc");
      })
      .paginate(page, limit);

    return response.ok(decks);
  }

  /**
   * Get the specified deck informations and cards
   */
  public async show({ request, response, bouncer }: HttpContextContract) {
    const deckId = request.param("id");
    const deck = await Deck.query()
      .where("id", deckId)
      .withAggregate("ratings", (query) => {
        query.count("*").as("votes");
      })
      .preload("creator")
      .preload("cards")
      .orderBy("createdAt")
      .firstOrFail();
    await bouncer.with("DeckPolicy").authorize("read", deck, bouncer);

    return response.ok(deck);
  }

  /**
   * Update the specified deck
   */
  public async update({ request, response, bouncer }: HttpContextContract) {
    const deckId = request.param("id");

    const deck = await Deck.findOrFail(deckId);
    await bouncer.with("DeckPolicy").authorize("write", deck, bouncer);

    const payload = await request.validate({
      schema: DecksUpdateSchema,
    });

    if (payload.folderId) {
      await deck.load("folder");
      const folder = await Folder.findOrFail(payload.folderId);
      if (folder.classroomId !== deck.folder.classroomId) {
        return response.forbidden({
          message: "You can't move a deck to another classroom",
        });
      }
    }

    const updatedDeck = await deck.merge(payload).save();
    response.ok(updatedDeck);
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

  /**
   * Update a new card to the deck
   */
  public async updateCard({
    request,
    response,
    params,
    bouncer,
  }: HttpContextContract) {
    const card = await Card.findOrFail(params.id);

    const payload = await request.validate({
      schema: CardsUpdateSchema,
    });

    await card.load("deck");

    await bouncer.with("DeckPolicy").authorize("write", card.deck, bouncer);

    await card.merge({ content: payload as CardContent }).save();
    return response.ok(card);
  }

  /**
   * Delete a card from the deck
   */
  public async destroyCard({ response, params, bouncer }: HttpContextContract) {
    const card = await Card.findOrFail(params.id);

    await card.load("deck");

    await bouncer.with("DeckPolicy").authorize("delete", card.deck, bouncer);

    await card.delete();
    return response.ok({ message: "Card deleted successfully" });
  }

  public async reportCard({
    request,
    response,
    params,
    bouncer,
    auth,
  }: HttpContextContract) {
    const card = await Card.findOrFail(params.id);

    const payload = await request.validate({
      schema: schema.create({
        message: schema.string(),
      }),
    });

    await card.load("deck");
    await bouncer.with("DeckPolicy").authorize("read", card.deck, bouncer);

    const { id, message } = await card.related("reports").create({
      message: payload.message,
      authorId: auth.user!.id,
      cardId: card.id,
    });

    return response.created({ id, message });
  }

  private async computeRating(deck: Deck) {
    const { sum, count } = await deck
      .related("ratings")
      .query()
      .pojo<{ sum: string; count: string }>()
      .sum("vote")
      .count("*")
      .firstOrFail();
    return {
      vote: parseInt(sum) || 0,
      count: parseInt(count),
    };
  }

  public async rate({ request, bouncer, auth }: HttpContextContract) {
    const deckId = request.param("id");
    const deck = await Deck.findOrFail(deckId);
    await bouncer.with("DeckPolicy").authorize("read", deck, bouncer);
    const { vote } = await request.validate({
      schema: schema.create({
        vote: schema.enum([-1, 1] as const),
      }),
    });
    await deck.related("ratings").sync({ [auth.user!.id]: { vote } }, false);
    return {
      ...(await this.computeRating(deck)),
      user_vote: vote,
    };
  }

  public async getRating({ request, bouncer, auth }: HttpContextContract) {
    const deckId = request.param("id");
    const deck = await Deck.findOrFail(deckId);
    await bouncer.with("DeckPolicy").authorize("read", deck, bouncer);
    const vote = await deck
      .related("ratings")
      .pivotQuery()
      .where("user_id", auth.user!.id)
      .first();
    return {
      ...(await this.computeRating(deck)),
      user_vote: vote,
    };
  }

  public async deleteRating({
    request,
    response,
    bouncer,
    auth,
  }: HttpContextContract) {
    const deckId = request.param("id");
    const deck = await Deck.findOrFail(deckId);
    await bouncer.with("DeckPolicy").authorize("read", deck, bouncer);
    await deck.related("ratings").detach([auth.user!.id]);
    return response.ok({ message: "Rating deleted successfully" });
  }
}
