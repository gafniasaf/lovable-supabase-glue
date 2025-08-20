import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
  title: "Pages/Notifications",
  parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Inbox: Story = {
  render: () => (
    <iframe title="Notifications Inbox" src="/dashboard/notifications" style={{ width: '100%', height: '80vh', border: '0' }} />
  )
};


