import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Layout from "../../app/edu/layout";

describe("/app/edu layout", () => {
  it("wraps children with AppShell", () => {
    render(<Layout>{"inside"}</Layout> as any);
    expect(screen.getByText("inside")).toBeInTheDocument();
  });
});


