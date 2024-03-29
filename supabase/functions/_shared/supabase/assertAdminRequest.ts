import { env } from "../env.ts";

export const assertAdminRequest = (request: Request) =>
  request.headers.get("Authorization") ===
  "Bearer " + env.SUPABASE_SERVICE_ROLE_KEY;
