import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../src/middleware/errorHandler";

vi.mock("../../src/services/tmdb.service", () => ({
    getResultSearchMovie: vi.fn(),
    getResultSearchTvShow: vi.fn(),
}));

import * as tmdbService from "../../src/services/tmdb.service";
import { searchByQuery } from "../../src/controllers/search.controller";

function createMockResponse(): Response {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res) as unknown as Response["status"];
    res.json = vi.fn().mockReturnValue(res) as unknown as Response["json"];
    return res;
}

describe("searchByQuery controller", () => {
    it("returns filtered movies and tv shows", async () => {
        const getResultSearchMovieMock = vi.mocked(tmdbService.getResultSearchMovie);
        const getResultSearchTvShowMock = vi.mocked(tmdbService.getResultSearchTvShow);

        getResultSearchMovieMock.mockResolvedValue({
            data: {
                results: [
                    { id: 1, title: "The Matrix" },
                    { id: 2, title: "" },
                    { id: 3, title: null },
                ],
                page: 1,
                total_pages: 1,
                total_results: 3,
            },
            error: null,
            status: 200,
        });

        getResultSearchTvShowMock.mockResolvedValue({
            data: {
                results: [
                    { id: 10, name: "Dark" },
                    { id: 11, name: "" },
                    { id: 12, name: null },
                ],
                page: 1,
                total_pages: 1,
                total_results: 3,
            },
            error: null,
            status: 200,
        });

        const req = { params: { query: "matrix" } } as unknown as Request<{ query: string }>;
        const res = createMockResponse();
        const next = vi.fn() as NextFunction;

        searchByQuery(req, res, next);

        await vi.waitFor(() => {
            expect(res.status).toHaveBeenCalledWith(200);
        });

        expect(res.json).toHaveBeenCalledWith({
            movies: [{ id: 1, title: "The Matrix" }],
            tvShows: [{ id: 10, name: "Dark" }],
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("forwards AppError when query is empty", async () => {
        const req = { params: { query: "   " } } as unknown as Request<{ query: string }>;
        const res = createMockResponse();
        const next = vi.fn() as NextFunction;

        searchByQuery(req, res, next);

        await vi.waitFor(() => {
            expect(next).toHaveBeenCalledTimes(1);
        });

        const firstArg = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
        expect(firstArg).toBeInstanceOf(AppError);
        expect((firstArg as AppError).statusCode).toBe(400);
        expect((firstArg as AppError).message).toBe("Invalid query");
    });

    it("forwards service errors", async () => {
        const getResultSearchMovieMock = vi.mocked(tmdbService.getResultSearchMovie);
        const getResultSearchTvShowMock = vi.mocked(tmdbService.getResultSearchTvShow);

        getResultSearchMovieMock.mockResolvedValue({
            data: null,
            error: "Movie service down",
            status: 503,
        });
        getResultSearchTvShowMock.mockResolvedValue({
            data: {
                results: [],
                page: 1,
                total_pages: 1,
                total_results: 0,
            },
            error: null,
            status: 200,
        });

        const req = { params: { query: "dark" } } as unknown as Request<{ query: string }>;
        const res = createMockResponse();
        const next = vi.fn() as NextFunction;

        searchByQuery(req, res, next);

        await vi.waitFor(() => {
            expect(next).toHaveBeenCalledTimes(1);
        });

        const firstArg = (next as unknown as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
        expect(firstArg).toBeInstanceOf(AppError);
        expect((firstArg as AppError).statusCode).toBe(503);
        expect((firstArg as AppError).message).toBe("Movie service down");
    });
});
