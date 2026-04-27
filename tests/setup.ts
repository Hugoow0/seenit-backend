import { afterEach, vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.TMDB_API_KEY = process.env.TMDB_API_KEY ?? "test-api-key";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";
process.env.PORT = process.env.PORT ?? "4000";

afterEach(() => {
    vi.restoreAllMocks();
});
