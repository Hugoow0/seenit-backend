import { Router } from "express";
import {
    getTvShowById,
    getTopRated,
    getPopular,
} from "../controllers/tvshows.controller";

const router = Router();
router.get("/details/:tvshowId", getTvShowById);
router.get("/top_rated", getTopRated);
router.get("/popular", getPopular);

export default router;
