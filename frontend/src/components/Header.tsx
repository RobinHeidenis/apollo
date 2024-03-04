import {Component, createSignal, Show} from "solid-js";
import {BsArrowRight} from "solid-icons/bs";

export const Header: Component<{date: string, isModified: boolean}> = ({date, isModified}) => {
  const [inputDate, setInputDate] = createSignal(date);
  const currentDate = new Date().toISOString().split('T', 1)[0];

  return (
    <div class={'flex text-pink flex-col items-center'}>
      <h1 class="pb-2 pt-6 text-5xl">Fractum Apollo</h1>
      <h2 class="text-3xl">
        Your personal feed of TLDR newsletters
      </h2>
      <div class={'flex items-center mt-5 gap-x-3'}>
        <input type="date" class={'w-fit border border-pink rounded-md p-3 bg-transparent text-lg'} min={'2022-01-31'} max={currentDate} value={inputDate()}
               onInput={(e) => setInputDate(new Date(e.target.value).toISOString().split('T', 1)[0])}/>
        <a class={'border border-pink rounded-md p-4'} href={`?date=${inputDate()}`}><BsArrowRight/></a>
      </div>
      <Show when={isModified}>
        <a href={'/'} class={'mt-2 underline underline-offset-4'}>Reset to today</a>
      </Show>
      <h3 class="mt-8 text-2xl">{date === currentDate ? "Today's entries" : `Entries for ${date}`}</h3>
    </div>
  );
};
