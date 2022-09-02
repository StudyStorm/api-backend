import { SwaggerConfig } from "@ioc:Adonis/Addons/Swagger";
import Application from "@ioc:Adonis/Core/Application";

export default {
  uiEnabled: Application.inDev,
  uiUrl: "docs", // url path to swaggerUI
  specEnabled: Application.inDev,
  specUrl: "/swagger.json",

  middleware: [], // middlewares array, for protect your swagger docs and spec endpoints

  options: {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "StudyStorm API",
        version: "1.0.0",
        description: "Main API for StudyStorm",
      },
    },

    apis: ["app/**/*.ts", "docs/swagger/**/*.yml", "start/routes.ts"],
    basePath: "/",
  },
  mode: process.env.NODE_ENV === "production" ? "PRODUCTION" : "RUNTIME",
  specFilePath: "docs/swagger.json",
} as SwaggerConfig;
