/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import {
  journalIdFromString,
  journalIdToString,
} from "@orbitinghail/sqlsync-worker";
import { Route, Router, useParams } from "@solidjs/router";
import { SQLSyncProvider } from "@orbitinghail/sqlsync-solid-js";

import workerUrl from "@orbitinghail/sqlsync-worker/worker.js?url";

import sqlSyncWasmUrl from "@orbitinghail/sqlsync-worker/sqlsync.wasm?url";
import { Component } from "solid-js";

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

const router = [
  {
    path: "/",
    loader: async () => {
      const docId = await newDocumentId();
      return redirect("/" + journalIdToString(docId));
    },
  },
  {
    path: "/named/:name",
    loader: async ({ params }) => {
      const docId = await newDocumentId(params.name);
      return redirect("/" + journalIdToString(docId));
    },
  },
  {
    path: "/:docId",
    element: <DocRoute />,
  },
];

const Main: Component = () => {
    return <div>

    </div>
};

render(
  () => (
    <SQLSyncProvider
      wasmUrl={sqlSyncWasmUrl}
      workerUrl={workerUrl}
      coordinatorUrl={COORDINATOR_URL_WS}
    >
            <Router>
                <Route path="/" component={Main}>

      </Router>
    </SQLSyncProvider>
  ),
  root!
);
