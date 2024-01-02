import { JournalId } from "@orbitinghail/sqlsync-worker";
import { useQuery } from "./doctype";
import "highlight.js/styles/atom-one-dark.css";
import {
  Component,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
} from "solid-js";
import Highlight from "solid-highlight";
import { Collapse } from "solid-collapse";

interface Props {
  docId: JournalId;
}

export const QueryViewerInner: Component<Props> = (props) => {
  const [inputValue, setInputValue] = createSignal("select * from tasks");
  const result = useQuery(() => props.docId, inputValue);

  createEffect(() => {
    console.log("inputValue", inputValue());
  });

  const rowsJson = createMemo(() => {
    return JSON.stringify(
      result().rows ?? [],
      (_, value) => {
        // handle bigint values
        if (typeof value === "bigint") {
          return value.toString();
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      },
      2
    );
  });

  createRenderEffect(() => {
    console.log(rowsJson());
  });

  createEffect(() => {
    const resultValue = result();
    if (resultValue.state === "error") {
      console.error("Query error", resultValue.error);
    }
  });

  return (
    <>
      <textarea
        value={inputValue()}
        class="font-mono w-full mb-2 p-4"
        onInput={(e) => setInputValue(e.currentTarget.value)}
        onChange={(e) => setInputValue(e.currentTarget.value)}
      />
      <Highlight
        autoDetect
        class="text-left text-sm rounded w-full"
        language="json"
      >
        {rowsJson()}
      </Highlight>
    </>
  );
};

export const QueryViewer = (props: Props) => {
  const [visible, setVisible] = createSignal(true);

  const toggle = () => {
    setVisible((p) => !p);
  };

  return (
    <div>
      <button onClick={toggle}>Query Viewer</button>
      <Collapse value={visible()}>
        <QueryViewerInner docId={props.docId} />
      </Collapse>
    </div>
  );
};
