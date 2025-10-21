import { createBrowserHistory } from "history";
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";
import "./styles/tailwind.css";
import reportWebVitals from "./reportWebVitals";
import { lightTheme } from "./styles/theme.css";

const history = createBrowserHistory();
// TODO: Review rules for scroll reset.
// TODO, put effect only in relevant pages
history.listen(() => {
  window.scrollTo(0, 0);
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <div className={lightTheme}>
      <App history={history} />
    </div>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// eslint-disable-next-line no-console
reportWebVitals(console.log);
