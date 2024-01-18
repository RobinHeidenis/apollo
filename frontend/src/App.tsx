import type { Component } from "solid-js";
import { Header } from "./components/Header";
import { Links } from "./components/Links";
import { Footer } from "./components/Footer";

const App: Component = () => {
  return (
    <div class={"flex flex-col"}>
      <Header />
      <Links />
      <Footer />
    </div>
  );
};

export default App;
