import { createEffect, createSignal } from "solid-js";
import solidLogo from "./assets/solid.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { JournalId } from "@orbitinghail/sqlsync-worker";
import { createDocHooks, useSQLSync } from "@orbitinghail/sqlsync-solid-js";
import { TaskDocType } from "./doctype";
// import { useMutate } from "./doctype";

interface AppProps {
  docId: JournalId;
}

const App = (props: AppProps) => {
  const [count, setCount] = createSignal(0);
  const { useMutate } = createDocHooks(() => TaskDocType);
  const sqlSync = useSQLSync();
  console.log("App: sqlSync", sqlSync);
  const mutate = useMutate(props.docId);

  createEffect(() => {
    console.log("init schema");
    mutate({ tag: "InitSchema" })
      .then(() => {
        console.log("Schema initialized");
      })
      .catch((err) => {
        console.error("Failed to init schema", err);
      });
  });

  console.log("App: props", props);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={solidLogo} class="logo solid" alt="Solid logo" />
        </a>
      </div>
      <h1>Vite + Solid</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count()}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">
        Click on the Vite and Solid logos to learn more
      </p>
    </>
  );
};

export default App;
