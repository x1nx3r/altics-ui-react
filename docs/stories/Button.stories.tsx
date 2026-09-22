import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../../src';
import { ButtonExamples } from '../../src/components/button/Button.examples';

const meta = {
  title: 'Buttons/Button',
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { text: 'Primary', variant: 'primary', size: 'md' },
};

/** The full sweep from the component's examples: variants, sizes, icons, states. */
export const Gallery: Story = {
  render: () => <ButtonExamples />,
};
