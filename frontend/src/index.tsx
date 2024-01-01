/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import {
  journalIdFromString,
  journalIdToString,
} from "@orbitinghail/sqlsync-worker";
import { Route, Router, useNavigate, useParams } from "@solidjs/router";
import {
  SQLSync,
  SQLSyncContext,
  SQLSyncProvider,
  useSQLSync,
  useSqlContext,
  createSignal as useSignal,
} from "@orbitinghail/sqlsync-solid-js";

import workerUrl from "@orbitinghail/sqlsync-worker/worker.js?url";

import sqlSyncWasmUrl from "@orbitinghail/sqlsync-worker/sqlsync.wasm?url";
import {
  createEffect,
  Component,
  createContext,
  ParentComponent,
  createSignal,
  useContext,
} from "solid-js";

const root = document.getElementById("root");

const isLocalhost =
  location.hostname === "localhost" || location.hostname.startsWith("192.168");

const COORDINATOR_URL = isLocalhost
  ? `${location.hostname}:8787`
  : "sqlsync.orbitinghail.workers.dev";

const COORDINATOR_URL_WS =
  (isLocalhost ? "ws" : "wss") + "://" + COORDINATOR_URL;

const newDocumentId = async (name = "") => {
  let url = `${location.protocol}//${COORDINATOR_URL}/new`;
  if (name.trim().length > 0) {
    url += "/" + encodeURIComponent(name);
  }
  const response = await fetch(url, {
    method: "POST",
  });

  return journalIdFromString(await response.text());
};

interface Props {
  workerUrl: string | URL;
  wasmUrl: string | URL;
  coordinatorUrl?: string | URL;
}

export const createSqlSync = (props: Props): SQLSync => {
  return new SQLSync(props.workerUrl, props.wasmUrl, props.coordinatorUrl);
};

export const DocRoute = () => {
  const { docId } = useParams();

  if (!docId) {
    console.error("doc id not found in params");
    return (
      <pre style={{ color: "red" }}>ERROR: doc id not found in params</pre>
    );
  } else {
    return <App docId={journalIdFromString(docId)} />;
  }
};

const Main: Component = () => {
  const navigate = useNavigate();

  createEffect(async () => {
    const docId = await newDocumentId();
    navigate("/" + journalIdToString(docId), { replace: true });
  });

  return <div>Redirecting</div>;
};

render(
  () => (
    <SQLSyncProvider
      wasmUrl={sqlSyncWasmUrl}
      workerUrl={workerUrl}
      coordinatorUrl={COORDINATOR_URL_WS}
    >
      <Router>
        <Route path="/" component={Main} />
        <Route path="/:docId" component={DocRoute} />
      </Router>
    </SQLSyncProvider>
  ),
  root!
);
