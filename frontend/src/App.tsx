import type {Component} from "solid-js";
import {Header} from "./components/Header";
import {Links} from "./components/Links";
import {Footer} from "./components/Footer";

const App: Component = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentDate = new Date().toISOString().split('T', 1)[0];
  const date = urlParams.get('date') ?? currentDate;
  const dateModified = urlParams.has('date')

  return (
    <div class={"flex flex-col"}>
      <Header date={date} isModified={dateModified}/>
      <Links date={date} isDefault={!urlParams.has('date')} />
      <Footer/>
    </div>
  );
};

export default App;
