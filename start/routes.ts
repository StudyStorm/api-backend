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
    Route.post("/login", "AuthController.login");
    Route.post("/logout", "AuthController.logout");
    Route.post("/register", "AuthController.register");
    Route.post("/verify", "AuthController.verifyEmail").as("verifyEmail");
    Route.post("/resend", "AuthController.resendVerifyEmail");
    Route.post("/forgot-password", "AuthController.forgotPassword");
    Route.get("/reset-password", "AuthController.resetPasswordInfo").as(
      "resetPassword"
    );
    Route.post("/reset-password", "AuthController.resetPassword");
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

      Route.get("/joined", "ClassroomsController.joined");
      Route.post("/:id/join", "ClassroomsController.join").where(
        "id",
        Route.matchers.uuid()
      );

      Route.post("/:id/leave", "ClassroomsController.leave").where(
        "id",
        Route.matchers.uuid()
      );

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
      Route.post("/cards/:id/report", "DecksController.reportCard").where(
        "id",
        Route.matchers.uuid()
      );
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

    // Inbox
    Route.group(() => {
      Route.get("/", "InboxesController.index");
      Route.get("/:id", "InboxesController.show").where(
        "id",
        Route.matchers.uuid()
      );
      Route.patch("/:id", "InboxesController.update").where(
        "id",
        Route.matchers.uuid()
      );
      Route.delete("/:id", "InboxesController.destroy").where(
        "id",
        Route.matchers.uuid()
      );
    }).prefix("inbox");
  }).middleware(["auth", "verified"]);
}).prefix("v1");
