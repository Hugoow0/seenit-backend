import { Router } from "express";
import { trendingMovies, trendingTvShows } from "../controllers/trending.controller";

const router = Router();

router.get("/movies", trendingMovies);
router.get("/tvshows", trendingTvShows);

export default router;
