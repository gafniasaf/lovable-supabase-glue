import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import InteractiveEmbedClient from "@/app/dashboard/student/[courseId]/InteractiveEmbedClient";

const launchUrl = "https://provider.example.com/launch?course=demo";
const allowed = (() => { try { const u = new URL(launchUrl); return `${u.protocol}//${u.host}`; } catch { return "https://provider.example.com"; } })();

const meta = {
  title: "Student/InteractiveEmbed",
  component: InteractiveEmbedClient,
  parameters: { layout: "fullscreen" }
} satisfies Meta<typeof InteractiveEmbedClient>;

export default meta;
type Story = StoryObj<typeof InteractiveEmbedClient>;

export const Default: Story = {
  args: { courseId: "course-1" as any, src: `${launchUrl}&token=storybook`, allowedOrigin: allowed },
  render: (args) => <InteractiveEmbedClient {...(args as any)} />
};


