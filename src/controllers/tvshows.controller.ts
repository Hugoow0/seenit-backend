import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import {
  getTVShowDetailsById,
  getTvShowSeasonDetailsById,
  TVShowSeasonDetails,
} from "../services/tmdb.service";

/**
 * GET /api/tvshows/:tvshowId
 * Returns TV show details and all season details (with episodes).
 */
export const getTvShowById = asyncHandler(
  async (req: Request<{ tvshowId: string }>, res: Response): Promise<void> => {
    const tvshowId = req.params.tvshowId;

    // Validate tvshowId is a positive integer
    const parsed = Number(tvshowId);
    if (isNaN(parsed) || parsed <= 0) {
      throw new AppError(400, "Invalid TV Show ID");
    }

    // Fetch TV show details
    const tvShowResponse = await getTVShowDetailsById(tvshowId);
    if (tvShowResponse.error || !tvShowResponse.data) {
      throw new AppError(
        tvShowResponse.status,
        tvShowResponse.error ?? "Failed to fetch TV show details"
      );
    }

    // Fetch all season details sequentially (mirrors original logic)
    const seasons: TVShowSeasonDetails[] = [];

    for (const season of tvShowResponse.data.seasons) {
      const seasonResponse = await getTvShowSeasonDetailsById(
        tvshowId,
        season.season_number.toString()
      );
      if (seasonResponse.error || !seasonResponse.data) {
        throw new AppError(
          seasonResponse.status,
          seasonResponse.error ?? "Failed to fetch season details"
        );
      }
      seasons.push(seasonResponse.data);
    }

    res.status(200).json({
      tvshow: tvShowResponse.data,
      seasons,
    });
  }
);
