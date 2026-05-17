import type { MetricType } from "web-vitals"

const reportWebVitals = (onPerfEntry?: (metric: MetricType) => void) => {
  if (typeof onPerfEntry === "function") {
    void import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry)
      onFCP(onPerfEntry)
      onINP(onPerfEntry)
      onLCP(onPerfEntry)
      onTTFB(onPerfEntry)
    })
  }
}

export default reportWebVitals
