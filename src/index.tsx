import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"
import { initAnalytics } from "./lib/analytics"
import "./index.css"
import "./styles/global.css"
import { darkThemeClass } from "@theme/darkTheme.css"
import { lightThemeClass } from "@theme/lightTheme.css"

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Failed to find the root element")

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
const themeClass = prefersDark ? darkThemeClass : lightThemeClass

document.documentElement.classList.add(themeClass)

initAnalytics()

const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
