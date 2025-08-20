import type { Meta, StoryObj } from "@storybook/react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
// Toast is composed via hook/region; no direct default export
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import InlineAlert from "@/components/ui/InlineAlert";
import EmptyState from "@/components/ui/EmptyState";
import DropdownMenu from "@/components/ui/DropdownMenu";

const meta = {
  title: "UI/Primitives",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Buttons: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="space-x-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <button className="underline">Link</button>
      </div>
      <div className="space-x-2">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>
  )
};

export const Inputs: Story = {
  render: () => (
    <div className="space-y-2">
      <Input placeholder="Type here" />
      <Input type="number" placeholder="123" />
    </div>
  )
};

export const TabsStory: Story = {
  render: () => (
    <Tabs>
      <TabList>
        <Tab href="#" active>One</Tab>
        <Tab href="#">Two</Tab>
      </TabList>
      <div className="p-4">Tab content here</div>
    </Tabs>
  )
};

export const Wayfinding: Story = {
  render: () => (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Section" }, { label: "Page" }]} />
      <Card className="p-4">Card content</Card>
    </div>
  )
};

export const Feedback: Story = {
  render: () => (
    <div className="space-y-3">
      <Spinner />
      <InlineAlert kind="info">Heads up</InlineAlert>
      <EmptyState title="Nothing here yet" description="Try creating your first item" />
    </div>
  )
};

export const People: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar name="Student User" />
      <Avatar name="Teacher User" />
    </div>
  )
};

export const Menus: Story = {
  render: () => (
    <DropdownMenu label="Open" items={[{ key: "a", label: "Action A" }, { key: "b", label: "Action B" }]} />
  )
};


