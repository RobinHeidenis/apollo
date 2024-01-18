import { Component } from "solid-js";

export const Header: Component = () => {
  return (
    <>
      <h1 class="text-pink pb-2 pt-6 text-center text-5xl">Fractum Apollo</h1>
      <h2 class="text-pink text-center text-3xl">
        Your personal feed of TLDR newsletters
      </h2>
      <h3 class="text-pink mt-8 text-center text-2xl">Today's entries</h3>
    </>
  );
};
