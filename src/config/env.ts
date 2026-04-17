import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  TMDB_API_KEY: string;
  CORS_ORIGIN: string;
}

function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;

  if (value === undefined) {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}. ` +
        `Please add it to your .env file. See .env.example for reference.`
    );
  }

  return value;
}

export const env: EnvConfig = {
  PORT: parseInt(getEnvVar("PORT", "4000"), 10),
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  TMDB_API_KEY: getEnvVar("TMDB_API_KEY"),
  CORS_ORIGIN: getEnvVar("CORS_ORIGIN", "*"),
};
