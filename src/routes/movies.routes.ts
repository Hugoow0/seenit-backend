import { Router } from "express";
import { getMovieById } from "../controllers/movies.controller";

const router = Router();

router.get("/:movieId", getMovieById);

export default router;
