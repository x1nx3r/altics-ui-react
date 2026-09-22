import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinkButton } from '../../src';
import { LinkButtonExamples } from '../../src/components/button/LinkButton.examples';

const meta = {
  title: 'Buttons/LinkButton',
  component: LinkButton,
  tags: ['autodocs'],
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof LinkButton>;

export const Default: Story = {
  args: { text: 'Documentation', color: 'gray' },
};

export const Gallery: Story = {
  render: () => <LinkButtonExamples />,
};
