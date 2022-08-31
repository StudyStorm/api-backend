import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import { ClassroomFactory } from "Database/factories/ClassroomFactory";
import { FolderFactory } from "Database/factories/FolderFactory";
import { faker } from "@faker-js/faker";
import { ClassroomAccessRight } from "App/Models/Classroom";

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
    const classrooms = await ClassroomFactory.with("rootFolder")
      .with("users", faker.datatype.number({ min: 1, max: 4 }), (user) => {
        user.pivotAttributes({
          access_right: faker.helpers.arrayElement(
            Object.values(ClassroomAccessRight)
          ),
        });
      })
      .createMany(10);
    await Promise.all(
      classrooms.map(async (classroom) => {
        // load root folder
        await classroom.load("rootFolder");
        // generate tree folder

        classroom.rootFolder.related("children").createMany(
          // generate 0 to 5 folders in root folder with 0 to 3 subfolders
          await generateTreeFolder(
            FolderFactory,
            faker.datatype.number(3),
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
                    .with("ratings", faker.datatype.number(1), (rating) => {
                      rating.merge({
                        userId: faker.helpers.arrayElement(classroom.users).id,
                      });
                    })
                    // in each deck, generate 0 to 4 cards
                    .with("cards", faker.datatype.number(4), (card) => {
                      card.with(
                        "reports",
                        faker.datatype.number(1),
                        (report) => {
                          report.merge({
                            authorId: faker.helpers.arrayElement(
                              classroom.users
                            ).id,
                          });
                        }
                      );
                    })
                )
          ).createMany(faker.datatype.number(5))
        );
      })
    );
  }
}
