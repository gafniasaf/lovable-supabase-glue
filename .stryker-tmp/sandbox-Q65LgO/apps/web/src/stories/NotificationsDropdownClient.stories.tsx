// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import NotificationsDropdownClient from "../app/components/NotificationsDropdownClient";
import NotificationsBellClient from "../app/components/NotificationsBellClient";

const meta = {
  title: "Header/NotificationsDropdown",
  component: NotificationsDropdownClient,
  parameters: { layout: "centered" }
} satisfies Meta<typeof NotificationsDropdownClient>;

export default meta;
type Story = StoryObj<typeof NotificationsDropdownClient>;

export const Default: Story = {
  args: {
    initial: Array.from({ length: 6 }).map((_, i) => ({
      id: `n-${i + 1}`,
      type: i % 2 ? "submission:graded" : "message:new",
      payload: i % 2 ? { score: 95 - i } : { thread_id: `t-${i + 1}` },
      created_at: new Date(Date.now() - i * 60000).toISOString(),
      read_at: i < 2 ? null : new Date().toISOString()
    }))
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <NotificationsDropdownClient {...args} />
    </div>
  )
};

export const Empty: Story = {
  args: { initial: [] },
  render: (args) => (
    <div style={{ width: 320 }}>
      <NotificationsDropdownClient {...args} />
    </div>
  )
};

export const BellBadge: Story = {
  render: () => (
    <div className="inline-flex items-center gap-2">
      <NotificationsBellClient initialUnread={3} />
    </div>
  )
};


