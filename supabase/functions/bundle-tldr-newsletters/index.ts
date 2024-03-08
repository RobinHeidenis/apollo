import "../_shared/ts-reset.d.ts";
import utf8 from "npm:utf8@3.0.0";
import { EntryWithTags } from "../_shared/types.ts";
import { getGoogleAccessToken } from "../_shared/google/getGoogleAccessToken.ts";
import { getSupabaseAdminClient } from "../_shared/supabase/getSupabaseAdminClient.ts";
import { unauthorizedResponse } from "../_shared/responses/unauthorized.ts";
import { okResponse } from "../_shared/responses/ok.ts";
import { errorResponse } from "../_shared/responses/error.ts";
import { assertAdminRequest } from "../_shared/supabase/assertAdminRequest.ts";
import {
  constructGmailMessagePromises,
  getAndParseGmailMessages,
  getGmailMessages,
} from "./gmail.ts";
import { parseMessages } from "./parser.ts";

const addEntriesToSupabase = async (
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  entries: EntryWithTags[],
) => {
  const { error } = await supabase.from("links").insert(
    entries
      .map((entry) => {
        if (!entry) throw new Error("No entry???");

        // We need at least a URL, otherwise it wouldn't make much sense to even add this entry
        if (!entry.url) {
          return;
        }

        if (entry.title === undefined && entry.description === undefined) {
          return;
        }

        console.log("Adding entry:", entry);

        const tryDecodeUtf8 = (str: string) => {
          try {
            return utf8.decode(str);
          } catch (e) {
            console.error(
              "Failed to decode string. String: \n",
              str,
              "\nError: \n",
              e,
            );
            return str;
          }
        };

        return {
          url: entry.url,
          description: tryDecodeUtf8(entry.description),
          title: tryDecodeUtf8(entry.title),
          sponsor: entry.sponsor,
          web_dev: entry.webdev,
          created_at: entry.date,
          tags: entry.tags,
        };
      })
      .filter(Boolean),
  );
  if (error) {
    console.error(error.message);
    throw error;
  }
};

Deno.serve(async (req) => {
  try {
    if (!assertAdminRequest(req)) return unauthorizedResponse();

    const accessToken = await getGoogleAccessToken();
    const supabase = getSupabaseAdminClient();

    const emailIds = await getGmailMessages(accessToken);
    const promises = constructGmailMessagePromises(accessToken, emailIds);
    const messages = await getAndParseGmailMessages(promises);
    const newsletters = await parseMessages(messages);

    for (const entries of newsletters) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await addEntriesToSupabase(supabase, await Promise.all(entries));
    }

    return okResponse({
      description: "Today's newsletters have been processed correctly",
      newsletters: newsletters.length,
      entries: newsletters.reduce((acc, curr) => acc + curr.length, 0),
    });
  } catch (e) {
    console.error(e);
    return errorResponse(
      e.message,
      "Something went wrong processing today's newsletters",
    );
  }
});
