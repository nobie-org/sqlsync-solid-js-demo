import { JournalId } from "@orbitinghail/sqlsync-worker";
import { useQuery } from "./doctype";
import "highlight.js/styles/stackoverflow-light.css";
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
      alert(resultValue.error.message);
    }
  });

  return (
    <>
      <textarea
        value={inputValue()}
        class="font-mono"
        onChange={(e) => setInputValue(e.currentTarget.value)}
      />
      {/* <Highlight language="json">{JSON.stringify(rowsJson())} </Highlight> */}
    </>
  );
};

export const QueryViewer = (props: Props) => {
  const [visible, setVisible] = createSignal(false);

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
