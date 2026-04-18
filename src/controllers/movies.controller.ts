import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import {
  getMovieDetailsById,
  getMovieCreditsById,
} from "../services/tmdb.service";

/**
 * GET /api/movies/:movieId
 * Returns movie details and top-3 cast credits.
 */
export const getMovieById = asyncHandler(
  async (req: Request<{ movieId: string }>, res: Response): Promise<void> => {
    const movieId = req.params.movieId;

    // Validate movieId is a positive integer
    const parsed = Number(movieId);
    if (isNaN(parsed) || parsed <= 0) {
      throw new AppError(400, "Invalid Movie ID");
    }

    // Fetch movie details
    const movieResponse = await getMovieDetailsById(movieId);
    if (movieResponse.error || !movieResponse.data) {
      throw new AppError(
        movieResponse.status,
        movieResponse.error ?? "Failed to fetch movie details"
      );
    }

    // Fetch credits
    const creditsResponse = await getMovieCreditsById(movieId);
    if (creditsResponse.error || !creditsResponse.data) {
      throw new AppError(
        creditsResponse.status,
        creditsResponse.error ?? "Failed to fetch movie credits"
      );
    }

    // Return top-3 cast members
    const topCast = creditsResponse.data.cast.slice(0, 3);

    res.status(200).json({
      movie: movieResponse.data,
      credits: [topCast],
    });
  }
);
