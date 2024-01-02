import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Database } from "../supabase.types.ts";

export const getSupabaseAdminClient = () => {
  return createClient<
    Database
  >(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
};
