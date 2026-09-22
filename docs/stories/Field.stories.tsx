import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Input, Label } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Fields/Field',
  component: Field,
  tags: ['autodocs'],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof Field>;

export const Assembly: Story = {
  render: () => (
    <Rows>
      <Row title="label, required, hint — Field wires id, describedby and required onto the child">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Email" required hint="We never share it.">
            <Input placeholder="you@example.com" />
          </Field>
          <Field label="Email" required error="Not a valid address.">
            <Input defaultValue="nope" />
          </Field>
          <Field label="Disabled">
            <Input disabled defaultValue="off" />
          </Field>
          <Field label="Hint only">
            <Input placeholder="…" />
          </Field>
        </div>
      </Row>
      <Row title="an error replaces the hint">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Email" hint="We never share your email.">
            <Input placeholder="you@example.com" />
          </Field>
          <Field label="Email" hint="We never share your email." error="Enter a valid email address.">
            <Input defaultValue="nope" />
          </Field>
        </div>
      </Row>
      <Row title="Label alone — for fields wired by hand">
        <div>
          <Label htmlFor="hand-wired">Email</Label>
          <Input id="hand-wired" placeholder="you@example.com" className="mt-2" />
        </div>
      </Row>
    </Rows>
  ),
};
