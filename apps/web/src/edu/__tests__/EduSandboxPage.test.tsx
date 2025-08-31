import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Page from "../../app/edu/sandbox/page";

describe("/edu/sandbox page", () => {
  it("renders DevSandbox title", () => {
    render(<Page /> as any);
    expect(screen.getByText(/Education Platform v2/i)).toBeInTheDocument();
  });
});


