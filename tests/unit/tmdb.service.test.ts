import {
    getMovieDetailsById,
    getNowPlayingMovies,
    type MovieListResponse,
} from "../../src/services/tmdb.service";

describe("tmdb.service", () => {
    const fetchMock = vi.fn();

    beforeAll(() => {
        vi.stubGlobal("fetch", fetchMock);
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    beforeEach(() => {
        fetchMock.mockReset();
    });

    it("returns typed data when TMDB responds with valid payload", async () => {
        const payload: MovieListResponse = {
            results: [{ id: 1, title: "Dune" }],
            page: 2,
            total_pages: 10,
            total_results: 200,
        };

        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => payload,
        });

        const response = await getNowPlayingMovies(2);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock.mock.calls[0]?.[0]).toContain("/movie/now_playing");
        expect(fetchMock.mock.calls[0]?.[0]).toContain("page=2");

        expect(response).toEqual({
            data: payload,
            error: null,
            status: 200,
        });
    });

    it("returns TMDB status and API error message when response is not ok", async () => {
        fetchMock.mockResolvedValue({
            ok: false,
            status: 404,
            statusText: "Not Found",
        });

        const response = await getMovieDetailsById("999999");

        expect(response.data).toBeNull();
        expect(response.status).toBe(404);
        expect(response.error).toBe("API Error: Not Found");
    });

    it("returns 500 when payload does not match zod schema", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                wrong_shape: true,
            }),
        });

        const response = await getNowPlayingMovies(1);

        expect(response.data).toBeNull();
        expect(response.status).toBe(500);
        expect(response.error).toBeTruthy();
    });

    it("returns 500 on network errors", async () => {
        fetchMock.mockRejectedValue(new Error("network down"));

        const response = await getNowPlayingMovies(1);

        expect(response.data).toBeNull();
        expect(response.status).toBe(500);
        expect(response.error).toBe("network down");
    });
});
