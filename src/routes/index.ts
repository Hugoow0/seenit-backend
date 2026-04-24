import { Router } from "express";
import healthRoutes from "./health.routes";
import tvshowsRoutes from "./tvshows.routes";
import trendingRoutes from "./trending.routes";
import moviesRoutes from "./movies.routes";
import searchRoutes from "./search.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/movies", moviesRoutes);
router.use("/tvshows", tvshowsRoutes);
router.use("/trending", trendingRoutes);
router.use("/search", searchRoutes);

export default router;
