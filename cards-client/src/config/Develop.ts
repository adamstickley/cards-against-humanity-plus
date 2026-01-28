import { Environment } from "./Environment";

export const Develop = new Environment("develop", {
  debug: true,
  apiBase: "https://api.develop.cardsonline.io",
  appBasePath: "https://app.develop.cardsonline.io",
  appDomain: "app.develop.cardsonline.io",
});
