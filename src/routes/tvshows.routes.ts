import { Router } from "express";
import { getTvShowById } from "../controllers/tvshows.controller";

const router = Router();

router.get("/:tvshowId", getTvShowById);

export default router;
