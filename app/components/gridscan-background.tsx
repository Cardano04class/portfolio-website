"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GridScan = dynamic(
  () => import("@/components/GridScan").then((m) => m.GridScan),
  { ssr: false }
);

type IdleCallbackHandle = number;
type IdleCallbackDeadline = {
  readonly didTimeout: boolean;
  timeRemaining: () => number;
};

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (
    callback: (deadline: IdleCallbackDeadline) => void,
    options?: { timeout: number }
  ) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

interface GridScanBackgroundProps {
  sensitivity: number;
  lineThickness: number;
  linesColor: string;
  gridScale: number;
  scanColor: string;
  scanOpacity: number;
  enablePost: boolean;
  bloomIntensity: number;
  chromaticAberration: number;
  noiseIntensity: number;
}

export default function GridScanBackground(props: GridScanBackgroundProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Defer WebGL + postprocessing work until after first paint/idle
    const enable = () => setEnabled(true);
    const w = window as WindowWithIdleCallback;

    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => enable(), { timeout: 1500 });
      return () => {
        if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(id);
      };
    }

    const t = window.setTimeout(enable, 500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10"
      style={{ width: "100vw", height: "100vh", zIndex: -10 }}
    >
      {enabled ? (
        <GridScan {...props} style={{ width: "100%", height: "100%" }} />
      ) : null}
    </div>
  );
}


