import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import ClassroomFactory from "Database/factories/ClassroomFactory";
import FolderFactory from "Database/factories/FolderFactory";
import { faker } from "@faker-js/faker";

/**
 * Generate tree of folders
 * @param folder - parent folder
 * @param depth - depth of tree
 * @param callback - callback function
 */
function generateTreeFolder<T extends typeof FolderFactory>(
  folder: T,
  depth: number,
  callback?: (folder: T) => void
) {
  if (depth <= 0) {
    return folder;
  }
  // curry function to decrease depth;
  const c = (f) => generateTreeFolder(callback?.(f) ?? f, depth - 1, callback);
  return folder.with("children", faker.datatype.number(depth * 3), c);
}

export default class extends BaseSeeder {
  public async run() {
    // Create user

    // Create classroom with user id
    const classrooms = await ClassroomFactory.with(
      "users",
      faker.datatype.number({ min: 1, max: 4 }),
      (user) => {
        user.pivotAttributes({ access_right: "owner" });
      }
    ).createMany(10);

    for (const classroom of classrooms) {
      // load root folder
      await classroom.load("rootFolder");
      // generate tree folder

      classroom.rootFolder.related("children").createMany(
        // generate 1 to 5 folders in root folder with 1 to 3 subfolders
        await generateTreeFolder(
          FolderFactory,
          faker.datatype.number({ min: 1, max: 3 }),
          (folder) =>
            // in each folder, generate 1 to 3 decks
            folder
              .merge({
                creatorId: faker.helpers.arrayElement(classroom.users).id,
              })
              .with("decks", faker.datatype.number(3), (deck) =>
                deck
                  .merge({
                    creatorId: faker.helpers.arrayElement(classroom.users).id,
                  })
                  // in each deck, generate 1 to 5 cards
                  .with("cards", faker.datatype.number(4))
                  //TODO: find a way to use existing users instead of creating new ones
                  .with("votes", faker.datatype.number(2), (user) => {
                    user.pivotAttributes({
                      vote: faker.helpers.arrayElement([1, -1]),
                    });
                  })
              )
        ).createMany(faker.datatype.number({ min: 1, max: 5 }))
      );
    }

    // Create folders with user id

    // Create decks with folder id

    // Create cards with deck id
  }
}
