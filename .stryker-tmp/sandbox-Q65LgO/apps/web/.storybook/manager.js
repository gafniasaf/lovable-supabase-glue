// @ts-nocheck
import { addons, types } from '@storybook/manager-api';

addons.register('role-switcher', () => {
  addons.add('role-switcher/tool', {
    title: 'Role',
    type: types.TOOL,
    match: ({ viewMode }) => !!viewMode,
    render: () => null
  });
});


