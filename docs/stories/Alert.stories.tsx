import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Text } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Display/Alert',
  component: Alert,
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="default">
        <Alert>
          <Text weight="semibold">Heads up.</Text>
          <Text>Accessible, token-based components.</Text>
        </Alert>
      </Row>
      <Row title="destructive">
        <Alert variant="destructive">
          <Text weight="semibold">Something went wrong.</Text>
          <Text>The document could not be uploaded.</Text>
        </Alert>
      </Row>
    </Rows>
  ),
};
