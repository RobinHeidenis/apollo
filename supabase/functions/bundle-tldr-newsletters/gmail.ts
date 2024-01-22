import {
  addHours,
  format,
  getUnixTime,
  startOfToday,
} from "npm:date-fns@3.0.6";
import { ListMessagesResponse, Message } from "../_shared/types.ts";

export const getGmailMessages = async (accessToken: string) => {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:dan@tldrnewsletter.com after:${getUnixTime(
    addHours(startOfToday(), 10),
  )} before:${getUnixTime(addHours(startOfToday(), 15))}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  const json = (await res.json()) as ListMessagesResponse;

  if (!json.messages) {
    throw new Error("Received no messages from Gmail");
  }

  return json.messages as { id: string; threadId: string }[];
};

export const constructGmailMessagePromises = (
  accessToken: string,
  emailIds: {
    id: string;
    threadId: string;
  }[],
) => {
  return emailIds.map(async (email): Promise<Message> => {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      },
    );

    const json = await res.json();

    return json as Message;
  });
};

export const getAndParseGmailMessages = async (
  promises: Promise<Message>[],
) => {
  const results: { body: string; date: string; from: string }[] = [];

  while (promises.length) {
    const promise = promises.shift();
    const result = await promise;
    if (!result) {
      console.error("No result");
      continue;
    }
    results.push({
      body: atob(
        result.payload?.parts?.[1].body?.data?.replace(/-/g, "+").replace(
          /_/g,
          "/",
        ) ?? "",
      ).replaceAll(/\s+/g, " "),
      date: format(
        new Date(
          result.payload?.headers?.find((entry) => entry.name === "Date")
            ?.value ?? "",
        ),
        "yyyy-MM-dd",
      ),
      from: result.payload?.headers?.find((entry) =>
        entry.name === "From"
      )?.value ?? "TLDR",
    });
  }

  return results;
};
