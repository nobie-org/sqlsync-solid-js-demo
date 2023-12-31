import { createEffect } from "solid-js";
import "./App.css";
import { JournalId } from "@orbitinghail/sqlsync-worker";
import { useMutate } from "./doctype";
import { TaskList } from "./TaskList";
import { QueryViewer } from "./QueryViewer";

interface AppProps {
  docId: JournalId;
}

const App = (props: AppProps) => {
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
    <div class="flex flex-col">
      <TaskList docId={props.docId} />
      <QueryViewer docId={props.docId} />
    </div>
  );
};

export default App;
