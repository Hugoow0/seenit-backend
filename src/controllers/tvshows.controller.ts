import { Request, Response } from "express";
import { asyncHandler, AppError } from "../middleware/errorHandler";
import {
    getTVShowDetailsById,
    getTvShowSeasonDetailsById,
    getTopRatedTVShows,
    getPopularTVShows,
    TVShowSeasonDetails,
} from "../services/tmdb.service";

/**
 * GET /api/tvshows/:tvshowId
 * Returns TV show details and all season details (with episodes).
 */
export const getTvShowById = asyncHandler(
    async (
        req: Request<{ tvshowId: string }>,
        res: Response,
    ): Promise<void> => {
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
                tvShowResponse.error ?? "Failed to fetch TV show details",
            );
        }

        // Fetch all season details sequentially (mirrors original logic)
        const seasons: TVShowSeasonDetails[] = [];

        for (const season of tvShowResponse.data.seasons) {
            const seasonResponse = await getTvShowSeasonDetailsById(
                tvshowId,
                season.season_number.toString(),
            );
            if (seasonResponse.error || !seasonResponse.data) {
                throw new AppError(
                    seasonResponse.status,
                    seasonResponse.error ?? "Failed to fetch season details",
                );
            }
            seasons.push(seasonResponse.data);
        }

        res.status(200).json({
            tvshow: tvShowResponse.data,
            seasons,
        });
    },
);

/**
 * GET /api/tvshows/top_rated
 * Returns a list of top-rated TV shows.
 */
export const getTopRated = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const response = await getTopRatedTVShows(page);

        if (response.error || !response.data) {
            throw new AppError(
                response.status,
                response.error ?? "Failed to fetch top rated TV shows",
            );
        }

        res.status(200).json(response.data);
    },
);

/**
 * GET /api/tvshows/popular
 * Returns a list of current popular TV shows.
 */
export const getPopular = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const response = await getPopularTVShows(page);

        if (response.error || !response.data) {
            throw new AppError(
                response.status,
                response.error ?? "Failed to fetch popular TV shows",
            );
        }

        res.status(200).json(response.data);
    },
);
