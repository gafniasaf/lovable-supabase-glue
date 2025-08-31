import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Page from "../../app/edu/courses/page";

describe("/edu/courses page", () => {
  it("renders All Courses heading", () => {
    render(<Page /> as any);
    expect(screen.getByRole("heading", { name: /All Courses/i })).toBeInTheDocument();
  });
});


