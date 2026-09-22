import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator, Text } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Display/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="horizontal — a rule between two blocks">
        <div>
          <Text>Above the line.</Text>
          <Separator className="my-4" />
          <Text>Below the line.</Text>
        </div>
      </Row>
      <Row title="vertical — a rule between two columns">
        <div className="flex h-16 items-center gap-4">
          <Text>Left</Text>
          <Separator orientation="vertical" />
          <Text>Right</Text>
        </div>
      </Row>
    </Rows>
  ),
};
