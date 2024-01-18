import { Component, createEffect, createSignal, For } from "solid-js";
import { supabase } from "../lib/supabaseClient";
import { NewsletterEntry } from "../lib/types";
import { Entry } from "./Entry";

export const Links: Component = () => {
  const [entries, setEntries] = createSignal<NewsletterEntry[]>([]);

  createEffect(async () => {
    try {
      const { data, error, status } = await supabase
        .from("links")
        .select("created_at, url, title, description, sponsor, web_dev, tags")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(50);

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setEntries(data);
      }
    } catch (e) {
      console.log(e);
    }
  });

  return (
    <div
      class={
        "text-flamingo bg-surface0 m:w-2/3 s mb-10 mt-5 flex w-full flex-col gap-y-4 self-center rounded-xl p-5 xl:w-1/2"
      }
    >
      <For each={entries()} fallback={<h1>Loading...</h1>}>
        {(entry) => <Entry entry={entry} />}
      </For>
    </div>
  );
};
