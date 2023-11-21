import React from "react";
import { getByLabelText, screen, render } from "@testing-library/react";
import App from "./App";

test("Labels", () => {
  global.matchMedia =
    global.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: function () {},
        removeListener: function () {},
      };
    };

  render(<App />);
  const container = document?.querySelector("#app");
  const add = screen.getByTestId("add");
  const remove = screen.getByTestId("remove");
  const reopen = screen.getByTestId("reopen");
});
