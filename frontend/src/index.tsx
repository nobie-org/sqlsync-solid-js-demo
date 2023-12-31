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
  SQLSyncContext,
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

export const SQLSyncContextLocal = createContext<[Accessor<SQLSync | null>]>([
  () => null,
]);

interface Props {
  workerUrl: string | URL;
  wasmUrl: string | URL;
  coordinatorUrl?: string | URL;
}

export const createSqlSync = (props: Props): SQLSync => {
  return new SQLSync(props.workerUrl, props.wasmUrl, props.coordinatorUrl);
};

export const SQLSyncProviderLocal: ParentComponent<Props> = (props) => {
  // const [sqlSync, setSQLSync] = createSignal<SQLSync | null>(createSqlSync(props));
  // console.log("sqlSync in provider:", sqlSync(), JSON.stringify(sqlSync(), null, 2));

  // const sqlSyncValue: [Accessor<SQLSync | null>] = [sqlSync];

  // createEffect(() => {
  //   const sqlSync = createSqlSync(props);
  //   console.log("sqlSync in effect:", sqlSync, JSON.stringify(sqlSync, null, 2));
  //   setSQLSync(sqlSync);
  //   onCleanup(() => {
  //     sqlSync.close();
  //   });
  // });

  return (
    <SQLSyncContext.Provider value={[() => createSqlSync(props)]}>
      {props.children}
    </SQLSyncContext.Provider>
  );
};

export const DocRoute = () => {
  const myContext = useMYContext();
  console.log("DocRoute: myContext", myContext, myContext?.[0]());
  const x = useSqlContextLocal();
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

// const router = [
//   {
//     path: "/",
//     loader: async () => {
//       const docId = await newDocumentId();
//       return redirect("/" + journalIdToString(docId));
//     },
//   },
//   {
//     path: "/named/:name",
//     loader: async ({ params }) => {
//       const docId = await newDocumentId(params.name);
//       return redirect("/" + journalIdToString(docId));
//     },
//   },
//   {
//     path: "/:docId",
//     element: <DocRoute />,
//   },
// ];

const useSqlContextLocal = () => {
  const sqlContext = useContext(SQLSyncContext);
  console.log("sqlContext", sqlContext);
  return sqlContext;
};

const Main: Component = () => {
  const navigate = useNavigate();
  const [num, setNum] = useMYContext()!;
  setNum(1909);
  const sqlContext = useSqlContextLocal();
  // const sqlSync = useSQLSync();
  // console.log("sqlSync", sqlSync);
  // console.log("sqlContext", sqlContext[0]()?.connectionStatus);
  // console.log("myContext", num);

  // console.log("Main: sqlSyncContext id", SQLSyncContext.id.toString());
  // const newSqlSync = useContext(SQLSyncContext);
  // console.log("newSqlSync", newSqlSync);

  // const sqlSync = ();

  createEffect(async () => {
    const docId = await newDocumentId();
    console.log("new doc id", docId);
    console.log("navigating...");
    // window.location.href = "/" + journalIdToString(docId);

    navigate("/" + journalIdToString(docId), { replace: true });
  });

  return <div>Redirecting</div>;
};

const MyContext = createContext<[() => number, (number: number) => void]>();

const MyCustomProvider: ParentComponent = (props) => {
  const [state, setState] = createSignal(0);

  return (
    <MyContext.Provider value={[state, setState]}>
      {props.children}
    </MyContext.Provider>
  );
};

const useMYContext = ():
  | [() => number, (number: number) => void]
  | undefined => {
  const state = useContext(MyContext);
  return state;
};

render(
  () => (
    <SQLSyncProviderLocal
      wasmUrl={sqlSyncWasmUrl}
      workerUrl={workerUrl}
      coordinatorUrl={COORDINATOR_URL_WS}
    >
      <MyCustomProvider>
        <Router>
          <Route path="/" component={Main} />
          <Route path="/:docId" component={DocRoute} />
        </Router>
      </MyCustomProvider>
    </SQLSyncProviderLocal>
  ),
  root!
);
