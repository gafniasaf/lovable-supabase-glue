// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

const meta = {
	title: "Profile/Editor",
	parameters: { layout: "fullscreen" }
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const Student: Story = {
	render: () => (
		<iframe title="Student Profile" src="/dashboard/student/profile" style={{ width: '100%', height: '80vh', border: '0' }} />
	)
};

export const Teacher: Story = {
	render: () => (
		<iframe title="Teacher Profile" src="/dashboard/teacher/profile" style={{ width: '100%', height: '80vh', border: '0' }} />
	)
};
