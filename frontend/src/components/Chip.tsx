import { Component } from "solid-js";

export const Chip: Component<{
  text: string;
  colorClass: string;
  class?: string;
}> = (props) => {
  return (
    <span
      class={`m-1 inline-block rounded-full px-2 py-1 font-medium ${props.colorClass} text-crust ${props.class}`}
    >
      <div class="max-w-full flex-initial text-xs font-normal leading-none">
        {props.text}
      </div>
    </span>
  );
};
