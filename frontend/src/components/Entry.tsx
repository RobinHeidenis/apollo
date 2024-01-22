import { Component } from "solid-js";
import { NewsletterEntry } from "../lib/types";
import { Chip } from "./Chip";
import { CgWebsite } from "solid-icons/cg";
import { AiOutlineTag } from "solid-icons/ai";
import { BiRegularDollarCircle } from "solid-icons/bi";

export const Entry: Component<{
  entry: NewsletterEntry;
}> = (props) => {
  return (
    <article
      class={`border-pink ${props.entry.sponsor ? "border-red" : ""} relative bottom-0 right-0 box-content grow rounded-xl border-2 p-3 md:w-[96%] md:transform md:transition-all md:duration-300 md:hover:bottom-1 md:hover:right-1.5 md:hover:border-b-8 md:hover:border-r-8`}
    >
      <a href={props.entry.url} target={"_blank"}>
        <div>
          <div class={"-ml-1 md:float-right md:ml-3"}>
            {props.entry.sponsor && (
              <Chip
                colorClass="bg-red"
                text="Sponsored"
                leftSection={<BiRegularDollarCircle class={"mr-0.5 inline"} />}
              />
            )}
            {props.entry.web_dev && (
              <Chip colorClass="bg-green" text="WebDev" />
            )}
            {!props.entry.title.toLowerCase().endsWith("(sponsor)") && (
              <Chip
                text={props.entry.title.match(/\((.*)\)/)[1]}
                colorClass={"bg-blue"}
              />
            )}
          </div>
          <h1 class={"text-2xl"}>{props.entry.title.replace(/\(.*\)$/, "")}</h1>
        </div>
        <p class={"mt-1"}>{props.entry.description}</p>
        <p class={"mt-3 flex items-center font-semibold"}>
          <CgWebsite class={"mr-1"} />
          {new URL(props.entry.url).hostname
            .replace(/^www\./, "")
            .split(".")
            .slice(0, -1)
            .join(".")}
        </p>
        <div class="-ml-1 mt-1 flex flex-wrap">
          {props.entry.tags.map((tag) => (
            <Chip
              colorClass="bg-mauve"
              class="mr-1"
              text={tag}
              leftSection={<AiOutlineTag class={"mr-1 inline"} />}
            />
          ))}
        </div>
      </a>
    </article>
  );
};
