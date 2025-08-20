// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import NumberField from "@/components/ui/NumberField";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import Radio from "@/components/ui/Radio";
import Switch from "@/components/ui/Switch";
import FormField from "@/components/ui/FormField";
import FormGrid from "@/components/ui/FormGrid";

const meta = {
  title: "UI/Forms",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Fields: Story = {
  render: () => (
    <FormGrid>
      <FormField label="Name" htmlFor="name"><Input id="name" placeholder="Jane" /></FormField>
      <FormField label="Age" htmlFor="age"><NumberField id="age" min={1} max={120} /></FormField>
      <FormField label="About" htmlFor="about"><TextArea id="about" rows={3} /></FormField>
      <FormField label="Role" htmlFor="role"><Select id="role" options={[{ value: 'student', label: 'Student' }, { value: 'teacher', label: 'Teacher' }]} /></FormField>
      <FormField label="Subscribe"><Checkbox label="Email updates" /></FormField>
      <FormField label="Preference"><Radio name="pref" label="A" /> <Radio name="pref" label="B" /></FormField>
      <FormField label="Enable notifications"><Switch /></FormField>
    </FormGrid>
  )
};


