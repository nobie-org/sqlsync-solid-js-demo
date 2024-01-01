import { useConnectionStatus } from "@orbitinghail/sqlsync-solid-js";
import { JournalId } from "@orbitinghail/sqlsync-worker";
import { useSetConnectionEnabled } from "./doctype";
import { JSX } from "solid-js";

export const ConnectionStatus = ({ docId }: { docId: JournalId }) => {
  const status = useConnectionStatus();
  const setConnectionEnabled = useSetConnectionEnabled(docId);

  const handleClick = () => {
    if (status() === "disabled") {
      setConnectionEnabled(true).catch((err) => {
        console.error("Failed to enable connection", err);
      });
    } else {
      setConnectionEnabled(false).catch((err) => {
        console.error("Failed to disable connection", err);
      });
    }
  };

  // @ts-ignore
  let color, icon, loading;
  switch (status()) {
    case "disabled":
      color = "gray";
      icon = <IconWifiOff style={{ width: rem(16), height: rem(16) }} />;
      break;
    case "disconnected":
      color = "gray";
      icon = <IconWifiOff style={{ width: rem(16), height: rem(16) }} />;
      break;
    case "connecting":
      color = "yellow";
      loading = true;
      break;
    case "connected":
      color = "green";
      icon = <IconWifi style={{ width: rem(16), height: rem(16) }} />;
      break;
  }

  return <button onClick={handleClick}>{status()}</button>;
};

interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {}

const IconWifi = (props: IconProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

const IconWifiOff = (props: IconProps) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a11 11 0 0 1 9.17-6.1" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// rem function converts pixels to rems based on the default font size
const rem = (px: number) => `${px / 16}rem`;
