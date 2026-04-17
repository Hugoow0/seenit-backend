import app from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
    console.log(
        `### SEENIT API - env:${env.NODE_ENV} - port:${String(env.PORT)}`,
    );
});
