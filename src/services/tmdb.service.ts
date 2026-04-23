import { z } from "zod";
import { env } from "../config/env";

export interface TMDBResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
}

const GenreSchema = z.object({
    id: z.number(),
    name: z.string(),
});

const ProductionCompanySchema = z.object({
    id: z.number(),
    name: z.string(),
});

const OriginalLanguageSchema = z.object({
    english_name: z.string(),
    iso_639_1: z.string(),
    name: z.string(),
});

// ----- Movie Schemas -----
const MovieDetailsSchema = z.object({
    id: z.number(),
    title: z.string(),
    overview: z.string().nullable(),
    vote_average: z.number(),
    release_date: z.string(),
    runtime: z.number().nullable(),
    status: z.string(),
    genres: z.array(GenreSchema),
    tagline: z.string().nullable(),
    production_companies: z.array(ProductionCompanySchema),
    adult: z.boolean().optional(),
    spoken_languages: z.array(OriginalLanguageSchema),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
});

const MovieCreditsSchema = z.object({
    id: z.number(),
    cast: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
        }),
    ),
});

// ----- TV Show Schemas -----
const SeasonSchema = z.object({
    id: z.number(),
    season_number: z.number(),
    episode_count: z.number(),
    name: z.string(),
    overview: z.string().nullable(),
    air_date: z.string().nullable(),
    poster_path: z.string().nullable(),
});

const CreatorSchema = z.object({
    id: z.number(),
    name: z.string(),
});

const NetworkSchema = z.object({
    id: z.number(),
    name: z.string(),
    logo_path: z.string().nullable(),
});

const TVShowDetailsSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string().nullable(),
    vote_average: z.number(),
    created_by: z.array(CreatorSchema),
    first_air_date: z.string(),
    last_air_date: z.string().nullable(),
    genres: z.array(GenreSchema),
    status: z.string(),
    number_of_episodes: z.number(),
    number_of_seasons: z.number(),
    seasons: z.array(SeasonSchema),
    adult: z.boolean().optional(),
    tagline: z.string().nullable(),
    networks: z.array(NetworkSchema),
    production_companies: z.array(ProductionCompanySchema),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
});

const EpisodeSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string().nullable(),
    air_date: z.string().nullable(),
    runtime: z.number().nullable(),
    show_id: z.number(),
    still_path: z.string().nullable(),
    vote_average: z.number(),
    episode_number: z.number(),
    season_number: z.number(),
});

const TVShowSeasonDetailsSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string().nullable(),
    season_number: z.number(),
    vote_average: z.number(),
    air_date: z.string().nullable(),
    episodes: z.array(EpisodeSchema),
});

// ----- Search Schemas -----
const SearchMovieSchema = z.object({
    id: z.number(),
    title: z.string().nullable().optional(),
    overview: z.string().nullable().optional(),
    poster_path: z.string().nullable().optional(),
    backdrop_path: z.string().nullable().optional(),
    media_type: z.string().optional(),
});

const SearchTVShowSchema = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    overview: z.string().nullable().optional(),
    poster_path: z.string().nullable().optional(),
    backdrop_path: z.string().nullable().optional(),
    media_type: z.string().optional(),
});

const SearchMovieResponseSchema = z.object({
    results: z.array(SearchMovieSchema),
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
});

const SearchTVShowResponseSchema = z.object({
    results: z.array(SearchTVShowSchema),
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
});

const MovieListResponseSchema = z.object({
    results: z.array(SearchMovieSchema),
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
    dates: z
        .object({
            maximum: z.string(),
            minimum: z.string(),
        })
        .optional(),
});

const TVShowListResponseSchema = z.object({
    results: z.array(SearchTVShowSchema),
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
});

// ----- Trending Schema -----
const TrendingMovieSchema = z.object({
    id: z.number(),
    title: z.string().nullable().optional(),
    overview: z.string().nullable().optional(),
    poster_path: z.string().nullable().optional(),
    backdrop_path: z.string().nullable().optional(),
    media_type: z.string().optional(),
});

const TrendingTVShowSchema = z.object({
    id: z.number(),
    name: z.string().nullable().optional(),
    overview: z.string().nullable().optional(),
    poster_path: z.string().nullable().optional(),
    backdrop_path: z.string().nullable().optional(),
    media_type: z.string().optional(),
});

const TrendingResponseSchema = z.object({
    results: z.array(z.union([TrendingMovieSchema, TrendingTVShowSchema])),
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
});

// Exported Types (inferred from Zod schemas)
export type MovieDetails = z.infer<typeof MovieDetailsSchema>;
export type MovieCredits = z.infer<typeof MovieCreditsSchema>;
export type TVShowDetails = z.infer<typeof TVShowDetailsSchema>;
export type TVShowSeasonDetails = z.infer<typeof TVShowSeasonDetailsSchema>;
export type SearchMovieResponse = z.infer<typeof SearchMovieResponseSchema>;
export type SearchTVShowResponse = z.infer<typeof SearchTVShowResponseSchema>;
export type MovieListResponse = z.infer<typeof MovieListResponseSchema>;
export type TVShowListResponse = z.infer<typeof TVShowListResponseSchema>;
export type TrendingResponse = z.infer<typeof TrendingResponseSchema>;

// Custom Error
class TMDBApiError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
        this.name = "TMDBApiError";
    }
}

// Generic TMDB Fetch — validates with Zod and returns a typed envelope
async function fetchTMDB<T>(
    url: string,
    schema: z.ZodSchema<T>,
): Promise<TMDBResponse<T>> {
    const options: RequestInit = {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${env.TMDB_API_KEY}`,
        },
    };

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new TMDBApiError(
                response.status,
                `API Error: ${response.statusText}`,
            );
        }

        const rawData: unknown = await response.json();
        const data = schema.parse(rawData);
        return { data, error: null, status: response.status };
    } catch (error) {
        return {
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
            status: error instanceof TMDBApiError ? error.status : 500,
        };
    }
}

// Movie Service Functions
export async function getMovieDetailsById(
    id: string,
): Promise<TMDBResponse<MovieDetails>> {
    const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;
    return fetchTMDB(url, MovieDetailsSchema);
}

export async function getMovieCreditsById(
    id: string,
): Promise<TMDBResponse<MovieCredits>> {
    const url = `https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`;
    return fetchTMDB(url, MovieCreditsSchema);
}

export async function getNowPlayingMovies(
    page: number = 1,
): Promise<TMDBResponse<MovieListResponse>> {
    const url = `https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${page}`;
    return fetchTMDB(url, MovieListResponseSchema);
}

export async function getTopRatedMovies(
    page: number = 1,
): Promise<TMDBResponse<MovieListResponse>> {
    const url = `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=${page}`;
    return fetchTMDB(url, MovieListResponseSchema);
}

export async function getTrendingMovies(): Promise<
    TMDBResponse<TrendingResponse>
> {
    const url =
        "https://api.themoviedb.org/3/trending/movie/week?language=en-US";
    return fetchTMDB(url, TrendingResponseSchema);
}

export async function getTrendingTvShows(): Promise<
    TMDBResponse<TrendingResponse>
> {
    const url = "https://api.themoviedb.org/3/trending/tv/week?language=en-US";
    return fetchTMDB(url, TrendingResponseSchema);
}

// TV Show Service Functions
export async function getTVShowDetailsById(
    id: string,
): Promise<TMDBResponse<TVShowDetails>> {
    const url = `https://api.themoviedb.org/3/tv/${id}?language=en-US`;
    return fetchTMDB(url, TVShowDetailsSchema);
}

export async function getTvShowSeasonDetailsById(
    tvShowId: string,
    seasonNumber: string,
): Promise<TMDBResponse<TVShowSeasonDetails>> {
    const url = `https://api.themoviedb.org/3/tv/${tvShowId}/season/${seasonNumber}?language=en-US`;
    return fetchTMDB(url, TVShowSeasonDetailsSchema);
}

export async function getTopRatedTVShows(
    page: number = 1,
): Promise<TMDBResponse<TVShowListResponse>> {
    const url = `https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=${page}`;
    return fetchTMDB(url, TVShowListResponseSchema);
}

export async function getPopularTVShows(
    page: number = 1,
): Promise<TMDBResponse<TVShowListResponse>> {
    const url = `https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`;
    return fetchTMDB(url, TVShowListResponseSchema);
}

// Search Service Functions
export async function getResultSearchMovie(
    q: string,
): Promise<TMDBResponse<SearchMovieResponse>> {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`;
    return fetchTMDB(url, SearchMovieResponseSchema);
}

export async function getResultSearchTvShow(
    q: string,
): Promise<TMDBResponse<SearchTVShowResponse>> {
    const url = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(q)}&include_adult=false&language=en-US&page=1`;
    return fetchTMDB(url, SearchTVShowResponseSchema);
}
