import { render } from "@testing-library/react"
import { BrowserRouter } from "react-router"
import { App } from "./App"

test("renders learn react link", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  )
  // const linkElement = screen.getByText(/learn react/i);
  // expect(linkElement).toBeInTheDocument();
})
