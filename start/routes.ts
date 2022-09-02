/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.get("/", async () => {
  return { hello: "DEMO" };
});

// Main api routes

Route.group(() => {
  // Auth
  Route.group(() => {
    Route.post("/login", "AuthController.login").as("login");
    Route.post("/logout", "AuthController.logout").as("logout");
    Route.post("/register", "AuthController.register").as("register");
    Route.get("/verify", "AuthController.verifyEmail").as("verifyEmail");
  });

  // Authenticated routes
  Route.group(() => {
    // Classrooms
    Route.group(() => {
      Route.get("/", "ClassroomsController.index");
      Route.post("/", "ClassroomsController.create");
      Route.get("/:id", "ClassroomsController.show")
        .where("id", Route.matchers.uuid())
        .as("show");
      Route.patch("/:id", "ClassroomsController.update")
        .where("id", Route.matchers.uuid())
        .as("update");
      Route.delete("/:id", "ClassroomsController.destroy")
        .where("id", Route.matchers.uuid())
        .as("destroy");

      // Classroom Users
      Route.group(() => {
        Route.get("/:id/users", "ClassroomsController.users").where(
          "id",
          Route.matchers.uuid()
        );
        Route.post("/users", "ClassroomsController.addUser");
        Route.patch("/users", "ClassroomsController.updateUser");
        Route.delete("/users", "ClassroomsController.removeUser");
      });
    }).prefix("classrooms");

    // Folders
    Route.group(() => {
      Route.get("/:id", "FoldersController.show").where(
        "id",
        Route.matchers.uuid()
      );
      Route.post("/:id", "FoldersController.create").where(
        "id",
        Route.matchers.uuid()
      );
      Route.post("/:id/decks", "FoldersController.createDeck").where(
        "id",
        Route.matchers.uuid()
      );
      Route.patch("/:id", "FoldersController.update").where(
        "id",
        Route.matchers.uuid()
      );
      Route.delete("/:id", "FoldersController.destroy").where(
        "id",
        Route.matchers.uuid()
      );
    }).prefix("folders");

    // Decks
    Route.group(() => {
      Route.get("", "DecksController.index");
      Route.get("/:id", "DecksController.show").where(
        "id",
        Route.matchers.uuid()
      );
      Route.patch("/:id", "DecksController.update").where(
        "id",
        Route.matchers.uuid()
      );
      Route.delete("/:id", "DecksController.destroy").where(
        "id",
        Route.matchers.uuid()
      );
      Route.post(":id/rate", "DecksController.rate").where(
        "id",
        Route.matchers.uuid()
      );
      Route.get(":id/rate", "DecksController.getRating").where(
        "id",
        Route.matchers.uuid()
      );
      Route.delete(":id/rate", "DecksController.deleteRating").where(
        "id",
        Route.matchers.uuid()
      );

      Route.post("/cards", "DecksController.addCard");
      Route.patch("/cards/:id", "DecksController.updateCard").where(
        "id",
        Route.matchers.uuid()
      );
      Route.delete("/cards/:id", "DecksController.destroyCard").where(
        "id",
        Route.matchers.uuid()
      );
    }).prefix("decks");

    // Profile
    Route.group(() => {
      Route.get("/", "ProfilesController.index");
      Route.patch("/", "ProfilesController.update");
      Route.delete("/", "ProfilesController.destroy");
    }).prefix("profile");
  }).middleware("auth");
}).prefix("v1");
