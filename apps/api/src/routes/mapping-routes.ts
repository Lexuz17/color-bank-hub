import { Hono } from "hono";
import * as mappings from "#api/controllers/mapping-controller.js";
import type { AppEnv } from "#api/middleware/auth.js";

export const mappingRoutes = new Hono<AppEnv>()
  .get("/mappings", mappings.listMappings)
  .get("/mappings/:id", mappings.findMapping)
  .post("/mappings", mappings.createMapping)
  .patch("/mappings/:id", mappings.updateMapping)
  .delete("/mappings/:id", mappings.deleteMapping)
  .put("/mappings/:id/folder", mappings.moveToFolder)
  .post("/mapping-folders", mappings.createFolder)
  .patch("/mapping-folders/:id", mappings.renameFolder)
  .delete("/mapping-folders/:id", mappings.deleteFolder);
