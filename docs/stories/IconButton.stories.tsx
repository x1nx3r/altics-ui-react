import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton, SearchLgIcon } from '../../src';
import { IconButtonExamples } from '../../src/components/button/IconButton.examples';

const meta = {
  title: 'Buttons/IconButton',
  component: IconButton,
  tags: ['autodocs'],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: { icon: <SearchLgIcon size={16} />, 'aria-label': 'Search', variant: 'primary' },
};

export const Gallery: Story = {
  render: () => <IconButtonExamples />,
};
