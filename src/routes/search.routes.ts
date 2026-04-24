import { Router } from "express";
import { searchByQuery } from "../controllers/search.controller";

const router = Router();

router.get("/:query", searchByQuery);

export default router;
