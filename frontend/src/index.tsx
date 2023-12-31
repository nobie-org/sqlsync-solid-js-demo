/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import {
  journalIdFromString,
  journalIdToString,
} from "@orbitinghail/sqlsync-worker";
import {
  Route,
  Router,
  redirect,
  useNavigate,
  useParams,
} from "@solidjs/router";
import {
  SQLSync,
  // SQLSyncContext,
  SQLSyncProvider,
  createDocHooks,
  useSQLSync,
  useSqlContext,
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
  Accessor,
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
  const myContext = useMYContext();
  console.log("DocRoute: myContext", myContext, myContext?.[0]());
  const x = useMyContext2();
  console.log("DocRoute: x", x);
  // const sqlSync = useSQLSync();
  // console.log("DocRoute: sqlSync", sqlSync);
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
  const [num, setNum] = useMYContext()!;
  console.log("Main: num", num());
  setNum(1909);
  console.log("Main: num", num());
  const [sync, setSync] = useMyContext2()!;
  // setSync(1909);
  console.log("Main: num", num());
  console.log("Main: sync", sync());

  createEffect(async () => {
    const docId = await newDocumentId();
    console.log("new doc id", docId);
    console.log("navigating...");
    // window.location.href = "/" + journalIdToString(docId);

    navigate("/" + journalIdToString(docId), { replace: true });
  });

  return <div>Redirecting</div>;
};

// const LocalSqlSyncContext =
//   createContext<[() => number, (number: number) => void]>();

const MyContext = createContext<[() => number, (number: number) => void]>();

export const MyContext2 =
  createContext<[() => SQLSync, (num: SQLSync) => void]>();

const MyCustomProvider: ParentComponent = (props) => {
  const [state, setState] = createSignal(0);

  return (
    <MyContext.Provider value={[state, setState]}>
      {props.children}
    </MyContext.Provider>
  );
};

interface MyContext2Props {
  workerUrl: string | URL;
  wasmUrl: string | URL;
  coordinatorUrl?: string | URL;
}

const MyContext2Provider: ParentComponent<MyContext2Props> = (props) => {
  const [state, setState] = createSignal(createSqlSync(props));

  return (
    <MyContext2.Provider value={[state, setState]}>
      {props.children}
    </MyContext2.Provider>
  );
};

const useMYContext = () => {
  const state = useContext(MyContext);
  return state;
};

const useMyContext2 = () => {
  const sqlContext = useContext(MyContext2);
  console.log("useMyContext2: sqlContext", sqlContext);
  return sqlContext;
};

render(
  () => (
    <MyCustomProvider>
      <MyContext2Provider
        wasmUrl={sqlSyncWasmUrl}
        workerUrl={workerUrl}
        coordinatorUrl={COORDINATOR_URL_WS}
      >
        <Router>
          <Route path="/" component={Main} />
          <Route path="/:docId" component={DocRoute} />
        </Router>
      </MyContext2Provider>
    </MyCustomProvider>
  ),
  root!
);
