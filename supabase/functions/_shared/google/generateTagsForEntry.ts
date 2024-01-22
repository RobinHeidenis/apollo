import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "npm:@google/generative-ai";

export async function generateTagsForEntry(entry: {
  title: string;
  description: string;
  url: string;
}): Promise<string[]> {
  try {
    const genAI = new GoogleGenerativeAI(
      Deno.env.get("GOOGLE_GEMINI_API_KEY") ?? "",
    );
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
      {
        text: "Your job is to add tags to newsletter entries. Output only the tags in a comma separated list. Add as many tags as you deem necessary, but at least 2 and no more than 5.",
      },
      {
        text: 'input: {\n  "title": "Inside Apple\'s Massive Push to Transform the Mac Into a Gaming Paradise (20 minute read)",\n  "description": "Apple\'s hardware can finally go toe to toe with some of the best PCs. The company is now aiming to make another attempt at becoming a gaming powerhouse. Its previous attempt in 1999 did not go so well. Now, Apple has larger and more capable teams with plenty of resources, and the company is used to playing the long game. This article looks at Apple\'s history with gaming, its hardware developments in recent years, and the company\'s push to make its systems more game-friendly.",\n  "url": "https://www.inverse.com/tech/mac-gaming-apple-silicon-interview"\n}',
      },
      {
        text: "output: Apple, Gaming, Hardware",
      },
      {
        text: 'input: {\n  "title": "Amazon plans to make its own hydrogen to power vehicles (3 minute read)",\n  "description": "Amazon plans to produce hydrogen fuel at its fulfillment centers. It has partnered with hydrogen company Plug Power to install an electrolyzer at a fulfillment center in Aurora, Colorado. The electrolyzer, which uses electricity to split water molecules to produce hydrogen, has the capacity to fuel up to 400 hydrogen fuel cell-powered forklifts. Amazon says that hydrogen is an important tool in its efforts to decarbonize its operations by 2040.",\n  "url": "https://www.theverge.com/2023/12/28/24017535/amazon-fulfillment-center-warehouse-hydrogen-fuel-plug"\n}',
      },
      {
        text: "output: Amazon, Hydrogen, EV, Clean Energy",
      },
      {
        text: 'input: {\n  "title": "The first EV with a lithium-free sodium battery hits the road in January (2 minute read)",\n  "description": "JAC Motors is launching an electric vehicle with a sodium-ion battery through its Yiwei brand. Sodium-ion batteries have lower density than lithium-ion batteries, but their lower cost, more abundant supplies, and superior cold-weather performance make them viable for mass EV adoption. The Yiwei EV will have a 252 km range with a 25 kWh capacity. Deliveries of the vehicle will begin in January.",\n  "url": "https://www.engadget.com/the-first-ev-with-a-lithium-free-sodium-battery-hits-the-road-in-january-214828536.html?guccounter=1"\n}',
      },
      {
        text: "output: EV, Battery",
      },
      {
        text: 'input: {\n  "title": "A Game-Changing Vaccine Could Lower \'Bad\' Cholesterol by 30% (2 minute read)",\n  "description": "Researchers have been able to lower low-density lipoprotein (LDL) levels using a vaccine based on a non-infectious virus particle that targets a protein known to have an important relationship to LDLs. LDLs can cause dangerous blockages in the arteries, reducing oxygen flow to the heart or causing blood clots that can lead to a stroke. The vaccine was able to reduce the bad cholesterol by up to 30% in animal models. It will still be a while before the technology can be used in humans, but it promises a solution that would be more affordable than current options and last around a year per dose.",\n  "url": "https://www.sciencealert.com/a-game-changing-vaccine-could-lower-bad-cholesterol-by-30"\n}',
      },
      {
        text: "output: Health, Vaccine, Cholesterol",
      },
      {
        text: 'input: {\n  "title": "Apache Hudi (GitHub Repo)",\n  "description": "Apache Hudi manages the storage of large analytical data sets on distributed file systems. It allows users to atomically publish data with rollback support, snapshot isolation between writer and queries, manage file sizes and layouts using statistics, and more. Hudi supports snapshot, incremental, and read-optimized queries.",\n  "url": "https://github.com/apache/hudi"\n}',
      },
      {
        text: "output: Apache, Big Data, Data Management",
      },
      {
        text: 'input: {\n  "title": "Cloudflare Workshop: React Server Components (Sponsor)",\n  "description": "React Server Components are a new way to build React apps that let you move some of your application logic from the client to the server. This can result in dramatically faster page loads, smaller client bundles, and a better user experience. In this workshop, you\'ll learn how to use React Server Components to build a simple app that renders a list of blog posts.",\n  "url": "https://reactservercomponents.com/?utm_source=tldrnewsletter"\n}',
      },
      {
        text: "output: React, Server Components, Cloudflare",
      },
      {
        text: `input: {\n  \"title\": \"${entry.title}\",\n  \"description\": \"${entry.description}\",\n  \"url\": \"${entry.url}\"\n}`,
      },
      { text: "output: " },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const text = response.text();

    const splitTags = text.split(",").map((tag) => tag.trim());

    if (splitTags.length <= 1) {
      console.warn(
        "Only one tag was generated. Something might be wrong with the model's output. Entry:",
        entry,
        "Model output:",
        text,
      );
    }

    return text.split(",").map((tag) => tag.trim());
  } catch (e) {
    console.error("Something went wrong generating tags");
    console.error(e);
    return [];
  }
}
