import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Display/Badge',
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: 'Badge', variant: 'default' },
};

export const Variants: Story = {
  render: () => (
    <Rows>
      <Row title="the four variants">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Row>
    </Rows>
  ),
};
