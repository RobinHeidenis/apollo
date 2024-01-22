import { Document } from "https://deno.land/x/deno_dom@v0.1.43/src/dom/document.ts";
import {
  DOMParser,
  initParser,
  Node,
} from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm-noinit.ts";
import { Entry, EntryWithTags } from "../_shared/types.ts";
import {generateTagsForEntry} from "../_shared/google/generateTagsForEntry.ts";

type NodeWithAttributes = Node & {
  attributes: { name: string; value: string }[];
};

export const getEntries = (document: Document) => {
  const entries: { url: string; title: string; description: string }[] = [];
  let errors = 0;
  document!.querySelectorAll(
    ".container div:not([style]) > span:not([style])",
  ).forEach((element) => {
    try {
      const url =
        (element.childNodes?.[1] as NodeWithAttributes)?.attributes?.[0]
          ?.value ??
          (element.childNodes?.[0] as NodeWithAttributes)?.attributes?.[0]
            ?.value ??
          "";
      const title =
        element.childNodes?.[1]?.childNodes?.[1]?.childNodes?.[1]?.childNodes
          ?.[0]?.nodeValue ??
          element.childNodes?.[0]?.childNodes?.[0]?.childNodes?.[0]?.childNodes
            ?.[0]?.nodeValue ??
          "";
      const description = element.childNodes?.[6]?.childNodes?.[0]?.nodeValue ??
        element.childNodes?.[7]?.childNodes?.[0]?.nodeValue ??
        element.childNodes?.[3]?.childNodes?.[0]?.nodeValue ??
        element.childNodes?.[5]?.childNodes?.[0]?.nodeValue ??
        "";
      entries.push({
        url,
        title,
        description: description.trim(),
      });
    } catch {
      errors++;
    }
  });
  document!.querySelectorAll(".container div:not([style]) > strong ~ span")
    .forEach((element) => {
      try {
        errors--;
        const div = element.parentNode!;
        const entry = {
          url: (div.childNodes[1].childNodes[0].childNodes[1]
            .childNodes[0] as NodeWithAttributes).attributes[0].value,
          title: div.childNodes[1].childNodes[0].childNodes[1].childNodes[0]
            .childNodes[0].nodeValue ?? "",
          description: element.textContent ?? "",
        };
        entries.push(entry);
      } catch (e) {
        errors++;
        console.error("Something went wrong in the alternative parsing");
        console.error(e);
      }
      if (errors > 0) {
        throw new Error(
          "Something went wrong parsing the newsletter, alternative parsing did not solve all errors",
        );
      }
    });

  return entries;
};

const parseUrl = (url: string) => {
  const decodedUrl = decodeURIComponent(url.split("/")[4]);
  let params = decodedUrl.split("?")[1];
  if (params !== "utm_source=tldrnewsletter") {
    const urlParams = new URLSearchParams(params);
    urlParams.delete("utm_source");
    params = urlParams.toString();
  } else params = "";

  return { params, decodedUrl };
};

export const parseMessages = async (
  messages: { body: string; date: string; from: string }[],
) => {
  await initParser();
  return messages
    .map((result) => {
      const document = new DOMParser().parseFromString(
        result.body,
        "text/html",
      );

      if (!document) {
        console.error(result);
        throw new Error("No document");
      }

      const entries = getEntries(document);
      if (entries.length === 0) {
        console.error(
          "No entries were found in this newsletter, something might be wrong",
        );
        console.log(result.date);
      }

      return {
        from: result.from,
        date: result.date,
        entries,
      };
    })
    .map((newsletter) => {
      return newsletter.entries
        .map((entry) => {
          if (!entry.url) {
            console.error("This entry has no URL", entry);
            return;
          }

          const { params, decodedUrl } = parseUrl(entry.url);

          return {
            ...entry,
            description: entry.description.trim(),
            url:
              decodedUrl.split("?")[0] +
              (params.length > 0 ? `?${params}` : ""),
            sponsor: entry.title.toLowerCase().includes("sponsor)"),
            webdev: newsletter.from.includes("Web Dev"),
            date: newsletter.date,
          } satisfies Entry;
        })
        .filter(Boolean);
    })
    .map((entries) =>
      entries.map(async (entry) => {
        return {
          ...entry,
          tags: await generateTagsForEntry(entry),
        } satisfies EntryWithTags;
      }),
    );
};
