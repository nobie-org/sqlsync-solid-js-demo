import { defineConfig, searchForWorkspaceRoot } from "vite";
import solid from "vite-plugin-solid";

const workspaceRoot = searchForWorkspaceRoot(process.cwd());
const wasmPath = `${workspaceRoot}/../reducer/target/wasm32-unknown-unknown/release/reducer.wasm`;
const wasmPathDebug = `${workspaceRoot}/../reducer/target/wasm32-unknown-unknown/debug/reducer.wasm`;

export default defineConfig({
  plugins: [solid()],
  optimizeDeps: {
    extensions: ["jsx"],
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), wasmPath, wasmPathDebug],
    },
  },
});
