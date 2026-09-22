import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Display/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="a line of skeleton text">
        <Skeleton className="h-4 w-2/3" />
      </Row>
      <Row title="a loading card — avatar circle and two lines">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </Row>
    </Rows>
  ),
};
