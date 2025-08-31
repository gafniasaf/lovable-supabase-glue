import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DevSandbox } from "../../edu/DevSandbox";

describe("DevSandbox", () => {
  it("renders Education Platform v2 title", () => {
    render(<DevSandbox />);
    expect(screen.getByText(/Education Platform v2/i)).toBeInTheDocument();
  });
});


