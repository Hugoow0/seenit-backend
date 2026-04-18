import { Router } from "express";
import healthRoutes from "./health.routes";
import moviesRoutes from "./movies.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/movies", moviesRoutes);

export default router;
