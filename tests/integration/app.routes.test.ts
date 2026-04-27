import request from "supertest";

import app from "../../src/app";

describe("API integration", () => {
    it("GET /api/health returns 200 with service status", async () => {
        const response = await request(app).get("/api/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(
            expect.objectContaining({
                success: true,
                status: true,
                timeStamp: expect.any(Number),
            }),
        );
    });

    it("returns 404 for unknown routes", async () => {
        const response = await request(app).get("/api/does-not-exist");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            error: "Route not found",
        });
    });
});
