import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Input, SearchLgIcon } from '../../src';
import { Row, Rows, chip } from './kit';

const meta = {
  title: 'Inputs/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: 'Email' },
};

export const Sizes: Story = {
  render: () => (
    <Rows>
      <Row title="the field ramp — 36 / 40 / 44 tall, text 14 / 16 / 16">
        <div className="space-y-4">
          <Input size="sm" placeholder="Small — 36px tall, 14px text" />
          <Input placeholder="Medium — 40px tall, 16px text" />
          <Input size="lg" placeholder="Large — 44px tall, 16px text" />
        </div>
      </Row>
    </Rows>
  ),
};

export const States: Story = {
  render: () => (
    <Rows>
      <Row title="filled, focused, disabled">
        <div className="space-y-4">
          <Input defaultValue="Filled" />
          <Input defaultValue="Focused" autoFocus />
          <Input defaultValue="Disabled" disabled />
        </div>
      </Row>
      <Row title="error — red-300 at rest, red-500 focused (verified across 36 sheet cells)">
        <Field label="Email" error="Enter a valid email address.">
          <Input defaultValue="nope" />
        </Field>
      </Row>
    </Rows>
  ),
};

export const Affixes: Story = {
  render: () => (
    <Rows>
      <Row title="value affixes — part of the value, on the region's 12px inset">
        <div className="space-y-4">
          <Input leading="Rp" inputMode="numeric" placeholder="0" />
          <Input leading={<SearchLgIcon size={16} />} placeholder="Search" />
        </div>
      </Row>
    </Rows>
  ),
};

export const Divider: Story = {
  render: () => (
    <Rows>
      <Row title="divided affixes — a panel each side; focus rings the value area and stops at the rule">
        <div className="space-y-4">
          <Input leading="https://" divider={{ leading: true }} placeholder="example.com" />
          <Input leading="Rp" trailing="IDR" divider={{ trailing: true }} defaultValue="25,000" />
        </div>
      </Row>
    </Rows>
  ),
};

export const Overflow: Story = {
  render: () => (
    <Rows>
      <Row title="wrap — trades the sheet height for a minimum and flows onto rows">
        <Input
          overflow="wrap"
          leading={[chip('Design system'), chip('React'), chip('TypeScript'), chip('Tokens')]}
          placeholder="Add"
        />
      </Row>
      <Row title="scroll — keeps the sheet height; the strip fades toward the edge">
        <Input
          overflow="scroll"
          leading={[
            chip('Design system'),
            chip('React'),
            chip('TypeScript'),
            chip('Tokens'),
            chip('Accessibility'),
          ]}
          placeholder="Add"
        />
      </Row>
    </Rows>
  ),
};
