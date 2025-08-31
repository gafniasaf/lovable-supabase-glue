import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Page from "../../app/edu/assignments/page";

describe("/edu/assignments page", () => {
  it("renders All Assignments heading", () => {
    render(<Page /> as any);
    expect(screen.getByRole("heading", { name: /All Assignments/i })).toBeInTheDocument();
  });
});


