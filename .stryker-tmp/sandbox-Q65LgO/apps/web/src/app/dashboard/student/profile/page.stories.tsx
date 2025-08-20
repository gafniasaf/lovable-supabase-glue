// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import Page from "./page";

const meta: Meta<typeof Page> = {
  title: "Student/ProfileEditor",
  component: Page,
  parameters: { layout: "fullscreen" }
};

export default meta;

type Story = StoryObj<typeof Page>;

export const Default: Story = {
  render: () => <Page />
};


