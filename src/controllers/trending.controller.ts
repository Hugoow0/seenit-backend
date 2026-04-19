import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import {
  getTrendingMovies,
  getTrendingTvShows,
} from "../services/tmdb.service";

/**
 * GET /api/trending/movies
 * Returns weekly trending movies.
 */
export const trendingMovies = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const response = await getTrendingMovies();
    if (response.error || !response.data) {
      res.status(response.status).json({
        success: false,
        error: response.error ?? "Failed to fetch trending movies",
      });
      return;
    }

    res.status(200).json(response.data);
  }
);

/**
 * GET /api/trending/tvshows
 * Returns weekly trending TV shows.
 */
export const trendingTvShows = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const response = await getTrendingTvShows();
    if (response.error || !response.data) {
      res.status(response.status).json({
        success: false,
        error: response.error ?? "Failed to fetch trending TV shows",
      });
      return;
    }

    res.status(200).json(response.data);
  }
);
