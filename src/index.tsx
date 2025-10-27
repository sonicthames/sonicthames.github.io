import React from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { App } from "./App"
import "./index.css"
import "./styles/tailwind.css"
import reportWebVitals from "./reportWebVitals"
import { lightTheme } from "./styles/theme.css"

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Failed to find the root element")

const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <div className={lightTheme}>
        <App />
      </div>
    </BrowserRouter>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// eslint-disable-next-line no-console
reportWebVitals(console.log)
