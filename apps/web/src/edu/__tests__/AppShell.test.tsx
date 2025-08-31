import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { AppShell } from "../../edu/components/AppShell";

describe("AppShell", () => {
  it("renders children content", () => {
    render(
      <AppShell>
        <p>hello</p>
      </AppShell>
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});


