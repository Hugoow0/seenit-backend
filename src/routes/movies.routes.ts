import { Router } from "express";
import {
    getMovieById,
    getNowPlaying,
    getTopRated,
} from "../controllers/movies.controller";

const router = Router();
router.get("/details/:movieId", getMovieById);
router.get("/now_playing", getNowPlaying);
router.get("/top_rated", getTopRated);

export default router;
