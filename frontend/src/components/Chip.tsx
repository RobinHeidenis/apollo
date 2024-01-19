import { Component, JSX } from "solid-js";

export const Chip: Component<{
  text: string;
  colorClass: string;
  class?: string;
  leftSection?: JSX.Element;
}> = (props) => {
  return (
    <span
      class={`m-1 inline-block rounded-full px-2 py-1 font-medium ${props.colorClass} text-crust ${props.class}`}
    >
      <div class="flex max-w-full flex-initial items-center text-xs font-normal leading-none">
        {props.leftSection ?? null}
        {props.text}
      </div>
    </span>
  );
};
