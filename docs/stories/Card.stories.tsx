import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Text } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Layout/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="header and content">
        <Card>
          <Card.Header>
            <Text weight="semibold">Card title</Text>
          </Card.Header>
          <Card.Content>
            <Text>Body content sits here, inside the bordered box.</Text>
          </Card.Content>
        </Card>
      </Row>
      <Row title="with a footer">
        <Card>
          <Card.Header>
            <Text weight="semibold">Settings</Text>
          </Card.Header>
          <Card.Content>
            <Text>Preferences for this workspace.</Text>
          </Card.Content>
          <Card.Footer>
            <Text size="tsm" color="tertiary">Last saved 2 minutes ago.</Text>
          </Card.Footer>
        </Card>
      </Row>
    </Rows>
  ),
};
