import { Component, createEffect, createSignal, For } from "solid-js";
import { supabase } from "../lib/supabaseClient";
import { NewsletterEntry } from "../lib/types";
import { Entry } from "./Entry";

export const Links: Component = () => {
  const [entries, setEntries] = createSignal<NewsletterEntry[]>([]);

  createEffect(async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_most_recent_entries")
        .order("id", { ascending: false });

      if (error) {
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
