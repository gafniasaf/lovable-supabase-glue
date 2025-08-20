// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import DataTable, { type Column } from "@/components/ui/DataTable";
import React from "react";

type Row = { id: string; name: string; email: string; score: number };

const meta = {
  title: "UI/DataTable",
} satisfies Meta;

export default meta;
type Story = StoryObj;

const columns: Column<Row>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'score', header: 'Score' }
];

const rows: Row[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', score: 92 },
  { id: '2', name: 'Bob', email: 'bob@example.com', score: 85 },
  { id: '3', name: 'Carol', email: 'carol@example.com', score: 98 }
];

export const Basic: Story = {
  render: () => <div className="p-4 max-w-2xl"><DataTable columns={columns} rows={rows} empty={<span>No data</span>} /></div>
};


