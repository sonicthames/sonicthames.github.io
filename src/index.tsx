import { createBrowserHistory } from "history";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

const history = createBrowserHistory();
// TODO: Review rules for scroll reset.
// TODO, put effect only in relevant pages
history.listen(() => (window.scrollTo(0, 0), undefined));

ReactDOM.render(
  <React.StrictMode>
    <App history={history} />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// eslint-disable-next-line no-console
reportWebVitals(console.log);
