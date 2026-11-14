import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { App } from "./App"
import { initAnalytics } from "./lib/analytics"
import "./index.css"
import "@theme/darkTheme.css"
import "@theme/global.css"

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Failed to find the root element")

initAnalytics()

const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
