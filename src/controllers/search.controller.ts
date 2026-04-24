import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import {
  getResultSearchMovie,
  getResultSearchTvShow,
} from "../services/tmdb.service";

/**
 * GET /api/search/:query
 * Multi-search: returns matching movies and TV shows, filtered to non-empty titles/names.
 */
export const searchByQuery = asyncHandler(
  async (req: Request<{ query: string }>, res: Response): Promise<void> => {
    const query = req.params.query;

    // Validate query is a non-empty string
    if (!query || query.trim().length === 0) {
      throw new AppError(400, "Invalid query");
    }

    // Search movies
    const searchMovieResponse = await getResultSearchMovie(query);
    if (searchMovieResponse.error || !searchMovieResponse.data) {
      throw new AppError(
        searchMovieResponse.status,
        searchMovieResponse.error ?? "Failed to search movies"
      );
    }

    // Search TV shows
    const searchTvShowResponse = await getResultSearchTvShow(query);
    if (searchTvShowResponse.error || !searchTvShowResponse.data) {
      throw new AppError(
        searchTvShowResponse.status,
        searchTvShowResponse.error ?? "Failed to search TV shows"
      );
    }

    // Filter out results with empty/null titles or names
    const filteredMovies = searchMovieResponse.data.results.filter(
      (item) => item.title && item.title !== ""
    );

    const filteredTvShows = searchTvShowResponse.data.results.filter(
      (item) => item.name && item.name !== ""
    );

    res.status(200).json({
      movies: filteredMovies,
      tvShows: filteredTvShows,
    });
  }
);
