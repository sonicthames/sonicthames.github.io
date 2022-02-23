import { useEffect, useState } from "react";
import { Subject } from "rxjs";

export function useWindowResize$() {
  const [$] = useState(() => new Subject<Window & typeof globalThis>());
  useEffect(() => {
    function resize() {
      $.next(window);
    }
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [$]);
  return $;
}
