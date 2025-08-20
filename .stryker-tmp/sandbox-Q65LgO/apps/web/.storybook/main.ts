// @ts-nocheck
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  // Restrict to canonical stories location to avoid picking up dynamic route folders
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y"
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {}
  },
  docs: {
    autodocs: true
  },
  toolbar: {
    title: { hidden: false }
  }
};
export default config;


