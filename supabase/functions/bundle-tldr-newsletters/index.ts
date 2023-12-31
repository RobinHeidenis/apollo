import './ts-reset.d.ts'
import {createClient} from "https://esm.sh/@supabase/supabase-js@2";
import {Database} from "./supabase.types.ts";
import {Document, DOMParser, initParser, Node,} from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm-noinit.ts";
import {addHours, format, getUnixTime, startOfToday, subDays} from "npm:date-fns@3.0.6";
import utf8 from 'npm:utf8@3.0.0';
import {GoogleGenerativeAI, HarmBlockThreshold, HarmCategory} from "npm:@google/generative-ai"

interface BaseEntry {
    title: string;
    description: string;
    url: string;
}

interface BaseEntryWithTags extends BaseEntry {
    tags: string[];
}

interface Entry extends BaseEntry {
    webdev: boolean;
    sponsor: boolean;
    date: string;
}

type EntryWithTags = BaseEntryWithTags & Entry;

async function generateTags(entry: { title: string, description: string, url: string }): Promise<BaseEntryWithTags> {
    try {
        const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_GEMINI_API_KEY") ?? "");
        const model = genAI.getGenerativeModel({model: "gemini-pro"});

        const generationConfig = {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
        };

        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ];

        const parts = [
            {text: "Your job is to add tags to newsletter entries. Output only in JSON. Change nothing about the original input. Add as many tags as you deem necessary, but no more than 5. "},
            {text: "input: {\n  \"title\": \"Inside Apple's Massive Push to Transform the Mac Into a Gaming Paradise (20 minute read)\",\n  \"description\": \"Apple's hardware can finally go toe to toe with some of the best PCs. The company is now aiming to make another attempt at becoming a gaming powerhouse. Its previous attempt in 1999 did not go so well. Now, Apple has larger and more capable teams with plenty of resources, and the company is used to playing the long game. This article looks at Apple's history with gaming, its hardware developments in recent years, and the company's push to make its systems more game-friendly.\",\n  \"url\": \"https://www.inverse.com/tech/mac-gaming-apple-silicon-interview\"\n}"},
            {text: "output: {\n  \"title\": \"Inside Apple's Massive Push to Transform the Mac Into a Gaming Paradise (20 minute read)\",\n  \"description\": \"Apple's hardware can finally go toe to toe with some of the best PCs. The company is now aiming to make another attempt at becoming a gaming powerhouse. Its previous attempt in 1999 did not go so well. Now, Apple has larger and more capable teams with plenty of resources, and the company is used to playing the long game. This article looks at Apple's history with gaming, its hardware developments in recent years, and the company's push to make its systems more game-friendly.\",\n  \"url\": \"https://www.inverse.com/tech/mac-gaming-apple-silicon-interview\",\n  \"tags\": [ \"Apple\", \"Gaming\", \"Hardware\" ]\n}"},
            {text: "input: {\n  \"title\": \"Amazon plans to make its own hydrogen to power vehicles (3 minute read)\",\n  \"description\": \"Amazon plans to produce hydrogen fuel at its fulfillment centers. It has partnered with hydrogen company Plug Power to install an electrolyzer at a fulfillment center in Aurora, Colorado. The electrolyzer, which uses electricity to split water molecules to produce hydrogen, has the capacity to fuel up to 400 hydrogen fuel cell-powered forklifts. Amazon says that hydrogen is an important tool in its efforts to decarbonize its operations by 2040.\",\n  \"url\": \"https://www.theverge.com/2023/12/28/24017535/amazon-fulfillment-center-warehouse-hydrogen-fuel-plug\"\n}"},
            {text: "output: {\n  \"title\": \"Amazon plans to make its own hydrogen to power vehicles (3 minute read)\",\n  \"description\": \"Amazon plans to produce hydrogen fuel at its fulfillment centers. It has partnered with hydrogen company Plug Power to install an electrolyzer at a fulfillment center in Aurora, Colorado. The electrolyzer, which uses electricity to split water molecules to produce hydrogen, has the capacity to fuel up to 400 hydrogen fuel cell-powered forklifts. Amazon says that hydrogen is an important tool in its efforts to decarbonize its operations by 2040.\",\n  \"url\": \"https://www.theverge.com/2023/12/28/24017535/amazon-fulfillment-center-warehouse-hydrogen-fuel-plug\",\n  \"tags\": [ \"Amazon\", \"Hydrogen\", \"EV\", \"Clean Energy\" ]\n}"},
            {text: "input: {\n  \"title\": \"The first EV with a lithium-free sodium battery hits the road in January (2 minute read)\",\n  \"description\": \"JAC Motors is launching an electric vehicle with a sodium-ion battery through its Yiwei brand. Sodium-ion batteries have lower density than lithium-ion batteries, but their lower cost, more abundant supplies, and superior cold-weather performance make them viable for mass EV adoption. The Yiwei EV will have a 252 km range with a 25 kWh capacity. Deliveries of the vehicle will begin in January.\",\n  \"url\": \"https://www.engadget.com/the-first-ev-with-a-lithium-free-sodium-battery-hits-the-road-in-january-214828536.html?guccounter=1\"\n}"},
            {text: "output: {\n  \"title\": \"The first EV with a lithium-free sodium battery hits the road in January (2 minute read)\",\n  \"description\": \"JAC Motors is launching an electric vehicle with a sodium-ion battery through its Yiwei brand. Sodium-ion batteries have lower density than lithium-ion batteries, but their lower cost, more abundant supplies, and superior cold-weather performance make them viable for mass EV adoption. The Yiwei EV will have a 252 km range with a 25 kWh capacity. Deliveries of the vehicle will begin in January.\",\n  \"url\": \"https://www.engadget.com/the-first-ev-with-a-lithium-free-sodium-battery-hits-the-road-in-january-214828536.html?guccounter=1\",\n  \"tags\": [ \"EV\", \"Innovation\" ]\n}"},
            {text: "input: {\n  \"title\": \"A Game-Changing Vaccine Could Lower 'Bad' Cholesterol by 30% (2 minute read)\",\n  \"description\": \"Researchers have been able to lower low-density lipoprotein (LDL) levels using a vaccine based on a non-infectious virus particle that targets a protein known to have an important relationship to LDLs. LDLs can cause dangerous blockages in the arteries, reducing oxygen flow to the heart or causing blood clots that can lead to a stroke. The vaccine was able to reduce the bad cholesterol by up to 30% in animal models. It will still be a while before the technology can be used in humans, but it promises a solution that would be more affordable than current options and last around a year per dose.\",\n  \"url\": \"https://www.sciencealert.com/a-game-changing-vaccine-could-lower-bad-cholesterol-by-30\"\n}"},
            {text: "output: {\n  \"title\": \"A Game-Changing Vaccine Could Lower 'Bad' Cholesterol by 30% (2 minute read)\",\n  \"description\": \"Researchers have been able to lower low-density lipoprotein (LDL) levels using a vaccine based on a non-infectious virus particle that targets a protein known to have an important relationship to LDLs. LDLs can cause dangerous blockages in the arteries, reducing oxygen flow to the heart or causing blood clots that can lead to a stroke. The vaccine was able to reduce the bad cholesterol by up to 30% in animal models. It will still be a while before the technology can be used in humans, but it promises a solution that would be more affordable than current options and last around a year per dose.\",\n  \"url\": \"https://www.sciencealert.com/a-game-changing-vaccine-could-lower-bad-cholesterol-by-30\",\n  \"tags\": [ \"Health\", \"Vaccine\", \"Cholesterol\" ]\n}"},
            {text: "input: {\n  \"title\": \"Apache Hudi (GitHub Repo)\",\n  \"description\": \"Apache Hudi manages the storage of large analytical data sets on distributed file systems. It allows users to atomically publish data with rollback support, snapshot isolation between writer and queries, manage file sizes and layouts using statistics, and more. Hudi supports snapshot, incremental, and read-optimized queries.\",\n  \"url\": \"https://github.com/apache/hudi\"\n}"},
            {text: "output: {\n  \"title\": \"Apache Hudi (GitHub Repo)\",\n  \"description\": \"Apache Hudi manages the storage of large analytical data sets on distributed file systems. It allows users to atomically publish data with rollback support, snapshot isolation between writer and queries, manage file sizes and layouts using statistics, and more. Hudi supports snapshot, incremental, and read-optimized queries.\",\n  \"url\": \"https://github.com/apache/hudi\",\n  \"tags\": [ \"GitHub Repo\", \"Apache\", \"Big Data\", \"Data Management\" ]\n}"},
            {text: `input: {\n  \"title\": \"${entry.title}\",\n  \"description\": \"${entry.description}\",\n  \"url\": \"${entry.url}\"\n}`},
            {text: "output: "},
        ];

        const result = await model.generateContent({
            contents: [{role: "user", parts}],
            generationConfig,
            safetySettings,
        });

        const response = result.response;
        const text = response.text()
        console.log(text)
        console.log(text.split('\n')[0])
        if (text.split('\n')[0] !== "{") {
            return JSON.parse(text.split('\n').slice(1, -1).join('\n')) as BaseEntryWithTags
        }

        return JSON.parse(text) as BaseEntryWithTags
    } catch (e) {
        console.error("Something went wrong generating tags");
        console.error(e);
        return {
            ...entry,
            tags: [],
        };
    }
}

export interface Message {
    historyId?: string | null;
    id?: string | null;
    internalDate?: string | null;
    labelIds?: string[] | null;
    payload?: MessagePart;
    raw?: string | null;
    sizeEstimate?: number | null;
    snippet?: string | null;
    threadId?: string | null;
}

export interface MessagePart {
    body?: MessagePartBody;
    filename?: string | null;
    headers?: MessagePartHeader[];
    mimeType?: string | null;
    partId?: string | null;
    parts?: MessagePart[];
}

export interface MessagePartBody {
    attachmentId?: string | null;
    data?: string | null;
    size?: number | null;
}

export interface MessagePartHeader {
    name?: string | null;
    value?: string | null;
}

interface ListMessagesResponse {
    messages?: { id?: string | null; threadId?: string | null }[];
    nextPageToken?: string | null;
    resultSizeEstimate?: number | null;
}

const getGoogleAccessToken = async () => {
    const res = await fetch("https://accounts.google.com/o/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
            client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
            refresh_token: Deno.env.get("GOOGLE_REFRESH_TOKEN") ?? "",
            grant_type: "refresh_token",
        }),
    });

    const json = await res.json() as {
        access_token: string;
        expires_in: number;
        scope: string;
        token_type: string;
    };

    return json.access_token;
};

const getSupabaseClient = () => {
    return createClient<
        Database
    >(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
};

const constructGmailMessagePromises = (
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

const getAndParseGmailMessages = async (promises: Promise<Message>[]) => {
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
            date: format(new Date(
                result.payload?.headers?.find((entry) => entry.name === "Date")
                    ?.value ?? "",
            ), 'yyyy-MM-dd'),
            from: result.payload?.headers?.find((entry) =>
                entry.name === "From"
            )?.value ?? "TLDR",
        });
    }

    return results;
};

type NodeWithAttributes = Node & {
    attributes: { name: string; value: string }[];
};

const getEntries = (document: Document) => {
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

    return {params, decodedUrl};
};

const parseMessages = async (
    messages: { body: string; date: string; from: string }[],
) => {
    await initParser();
    return messages.map((result) => {
        const document = new DOMParser().parseFromString(result.body, "text/html");

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
    }).map((newsletter) => {
        return newsletter.entries.map((entry) => {
            if (!entry.url) {
                console.error("This entry has no URL", entry);
                return;
            }

            const {params, decodedUrl} = parseUrl(entry.url);

            return ({
                ...entry,
                description: entry.description.trim(),
                url: decodedUrl.split("?")[0] + (params.length > 0 ? `?${params}` : ""),
                sponsor: entry.title.toLowerCase().includes("sponsor)"),
                webdev: newsletter.from.includes("Web Dev"),
                date: newsletter.date,
            }) satisfies Entry;
        }).filter(Boolean);
    }).map((entries) => {
        return entries.map(async (entry) => {
            const generatedEntryWithTags = await generateTags(entry);

            return {...entry, tags: generatedEntryWithTags.tags} satisfies EntryWithTags;
        })
    });
};

const addEntriesToSupabase = async (
    supabase: ReturnType<typeof getSupabaseClient>,
    entries: EntryWithTags[],
) => {
    const {error} = await supabase.from("links").insert(
        entries.map((entry) => {
            if (!entry) throw new Error("No entry???");
            if (
                entry.url === undefined && entry.description === undefined &&
                entry.title === undefined
            ) return;

            return {
                url: entry.url,
                description: utf8.decode(entry.description),
                title: utf8.decode(entry.title),
                sponsor: entry.sponsor,
                web_dev: entry.webdev,
                created_at: entry.date,
                tags: entry.tags,
            };
        }).filter(Boolean),
    );
    if (error) {
        console.error(error.message);
        throw error;
    }
};

const getGmailMessages = async (
    accessToken: string,
) => {
    const url =
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:dan@tldrnewsletter.com after:${
            getUnixTime(addHours(subDays(startOfToday(), 2), 10))
        } before:${getUnixTime(addHours(subDays(startOfToday(), 2), 15))}`;
    const res = await fetch(
        url,
        {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        },
    );
    const json = await res.json() as ListMessagesResponse;

    if (!json.messages) {
        throw new Error("Received no messages from Gmail");
    }

    return json.messages as { id: string; threadId: string }[];
};

const checkEnvironmentVariables = () => {
    if (!Deno.env.get("GOOGLE_CLIENT_ID")) {
        throw new Error("GOOGLE_CLIENT_ID is not set");
    }
    if (!Deno.env.get("GOOGLE_CLIENT_SECRET")) {
        throw new Error("GOOGLE_CLIENT_SECRET is not set");
    }
    if (!Deno.env.get("GOOGLE_REFRESH_TOKEN")) {
        throw new Error("GOOGLE_REFRESH_TOKEN is not set");
    }
    if (!Deno.env.get("GOOGLE_GEMINI_API_KEY")) {
        throw new Error("GOOGLE_GEMINI_API_KEY is not set");
    }
    if (!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    if (!Deno.env.get("SUPABASE_URL")) {
        throw new Error("SUPABASE_URL is not set");
    }
}

Deno.serve(async (req) => {
    try {
        checkEnvironmentVariables();
        if (
            req.headers.get("Authorization") !==
            "Bearer " + Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
        ) {
            return new Response(
                JSON.stringify({
                    code: 401,
                    message: "Unauthorized",
                    description: "You are not authorized to access this endpoint",
                }),
                {headers: {"Content-Type": "application/json"}, status: 401},
            );
        }
        const accessToken = await getGoogleAccessToken();
        const supabase = getSupabaseClient();

        const emailIds = await getGmailMessages(accessToken);
        const promises = constructGmailMessagePromises(accessToken, emailIds);
        const messages = await getAndParseGmailMessages(promises);
        const newsletters = await parseMessages(messages);

        for (const entries of newsletters) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await addEntriesToSupabase(supabase, await Promise.all(entries));
        }

        return new Response(
            JSON.stringify({
                code: 200,
                message: "OK",
                description: "Today's newsletters have been processed correctly",
                newsletters: newsletters.length,
                entries: newsletters.reduce((acc, curr) => acc + curr.length, 0),
            }),
            {headers: {"Content-Type": "application/json"}},
        );
    } catch (e) {
        console.error(e);
        return new Response(
            JSON.stringify({
                code: 500,
                message: "Internal Server Error",
                description: "Something went wrong processing today's newsletters",
                error: e.message,
            }),
            {headers: {"Content-Type": "application/json"}, status: 500},
        );
    }
});
