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

Route.get("folder/desc/:id", "FoldersController.getDescendants");
Route.get("folder/asc/:id", "FoldersController.getAscendants");

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
    Route.get("/classrooms", "ClassroomsController.index").as("index");
    Route.post("/classrooms", "ClassroomsController.create").as("create");
    Route.get("/classrooms/:id", "ClassroomsController.show")
      .where("id", Route.matchers.uuid())
      .as("show");
    Route.patch("/classrooms/:id", "ClassroomsController.update")
      .where("id", Route.matchers.uuid())
      .as("update");
    Route.delete("/classrooms/:id", "ClassroomsController.destroy")
      .where("id", Route.matchers.uuid())
      .as("destroy");
  }).middleware("auth");
}).prefix("v1");
