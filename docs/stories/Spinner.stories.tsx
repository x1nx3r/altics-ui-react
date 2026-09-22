import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Display/Spinner',
  component: Spinner,
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="sizes — 16, 20 (default) and 32">
        <div className="flex items-center gap-6">
          <Spinner size={16} />
          <Spinner />
          <Spinner size={32} />
        </div>
      </Row>
      <Row title="inline with text — tinted by the surrounding colour">
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <Spinner size={16} /> Uploading…
        </p>
      </Row>
    </Rows>
  ),
};
