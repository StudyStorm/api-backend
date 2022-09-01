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

Route.group(() => {
  // Auth
  Route.group(() => {
    Route.post("/login", "AuthController.login").as("login");
    Route.post("/logout", "AuthController.logout").as("logout");
    Route.post("/register", "AuthController.register").as("register");
    Route.get("/verify", "AuthController.verifyEmail").as("verifyEmail");
  });

  // Classrooms
  Route.group(() => {
    Route.get("/classrooms", "ClassroomsController.index");
    Route.post("/classrooms", "ClassroomsController.create");
    Route.get("/classrooms/:id", "ClassroomsController.show").where(
      "id",
      Route.matchers.uuid()
    );
    Route.patch("/classrooms/:id", "ClassroomsController.update").where(
      "id",
      Route.matchers.uuid()
    );
    Route.delete("/classrooms/:id", "ClassroomsController.destroy").where(
      "id",
      Route.matchers.uuid()
    );
    // Classroom Users
    Route.get("/classrooms/:id/users", "ClassroomsController.users").where(
      "id",
      Route.matchers.uuid()
    );
    Route.post("/classrooms/users", "ClassroomsController.addUser");
    Route.patch("/classrooms/users", "ClassroomsController.updateUser");
    Route.delete("/classrooms/users/", "ClassroomsController.removeUser");
  }).middleware("auth");

  // Profile
  Route.group(() => {
    Route.get("/profile", "ProfilesController.index");
    Route.patch("/profile", "ProfilesController.update");
    Route.delete("/profile", "ProfilesController.destroy");
  }).middleware("auth");
}).prefix("v1");
