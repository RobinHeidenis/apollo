import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

export const definedString = (name: string) =>
  z.string({
    invalid_type_error: `${name} has to be a string`,
    required_error: `${name} is required`,
  }).min(1, `${name} has to be at least 1 character`);

export const envSchema = z.object({
  GOOGLE_CLIENT_ID: definedString("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: definedString("GOOGLE_CLIENT_SECRET"),
  GOOGLE_REDIRECT_URL: definedString("GOOGLE_REDIRECT_URL"),
  GOOGLE_REFRESH_TOKEN: definedString("GOOGLE_REFRESH_TOKEN"),
  GOOGLE_GEMINI_API_KEY: definedString("GOOGLE_GEMINI_API_KEY"),
  SUPABASE_URL: definedString("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: definedString("SUPABASE_SERVICE_ROLE_KEY"),
}).required();

export const checkEnvironmentVariables = (): Required<
  z.infer<typeof envSchema>
> => {
  try {
    const env = Deno.env.toObject();

    return envSchema.parse(env);
  } catch (e) {
    console.error("❌", " Environment variables are not set correctly");
    throw e;
  }
};

export const env = checkEnvironmentVariables();
