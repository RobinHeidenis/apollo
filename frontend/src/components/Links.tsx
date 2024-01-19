import { Component, createEffect, createSignal, For } from "solid-js";
import { supabase } from "../lib/supabaseClient";
import { NewsletterEntry } from "../lib/types";
import { Entry } from "./Entry";
import { CgSpinner } from "solid-icons/cg";
import { VsDebugDisconnect } from "solid-icons/vs";

const getMostRecentEntries = async () => {
  const { data, error } = await supabase
    .rpc("get_most_recent_entries")
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }
};

export const Links: Component = () => {
  const [entries, setEntries] = createSignal<NewsletterEntry[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const doFunnyLoadingEffect = Math.random() <= 0.3;

  createEffect(async () => {
    try {
      const data = await getMostRecentEntries();

      if (data) {
        setEntries(data);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage(e.message);
    } finally {
      doFunnyLoadingEffect
        ? setTimeout(() => setIsLoading(false), 2000)
        : setIsLoading(false);
    }
  });

  return (
    <div
      class={`text-flamingo bg-surface0 s mb-10 mt-5 flex w-full flex-col gap-y-4 self-center rounded-xl p-5 md:w-2/3 xl:w-1/2`}
    >
      {isLoading() ? (
        doFunnyLoadingEffect ? (
          <h1 class={"animate-spin text-center text-2xl"}>Loading entries</h1>
        ) : (
          <h1 class={"flex items-center justify-center text-2xl"}>
            <CgSpinner class={"mr-2 inline animate-spin"} />
            Loading entries
          </h1>
        )
      ) : errorMessage() ? (
        <div class={"text-center"}>
          <h1 class={"text-red text-3xl"}>
            <VsDebugDisconnect class={"inline"} /> Error loading entries :(
          </h1>
          <h2 class={"mt-1 text-2xl"}>Try reloading the page</h2>
          <p class={"mt-3 text-xl"}>This is the error, in case that helps:</p>
          <p class={"text-xl"}>{errorMessage()}</p>
        </div>
      ) : (
        <For each={entries()} fallback={<h1>No entries found :(</h1>}>
          {(entry) => <Entry entry={entry} />}
        </For>
      )}
    </div>
  );
};
