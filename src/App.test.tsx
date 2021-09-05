import { render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import React from "react";
import { App } from "./App";

test("renders learn react link", () => {
  const history = createMemoryHistory();
  render(<App history={history} />);
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
});
