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
import Env from "@ioc:Adonis/Core/Env";

Route.get("/", async () => {
  return { hello: "DEMO" };
});

Route.group(() => {
  Route.post("/login", "AuthController.login").as("login");
  Route.post("/logout", "AuthController.logout").as("logout");
  Route.post("/register", "AuthController.register").as("register");
  Route.get("/verify", "AuthController.verifyEmail").as("verifyEmail");
}).prefix("v1");

Route.get("/dashboard", async ({ auth }) => {
  await auth.use("web").authenticate();
  return auth.use("web").user;
});
