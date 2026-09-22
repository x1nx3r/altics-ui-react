import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, NumberInput } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Inputs/NumberInput',
  component: NumberInput,
  tags: ['autodocs'],
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const Horizontal: Story = {
  render: () => (
    <Rows>
      <Row title="horizontal — steppers at each end, the value centred">
        <div className="grid grid-cols-3 gap-6">
          <Field label="Quantity">
            <NumberInput defaultValue={5} min={0} max={10} />
          </Field>
          <Field label="Price" hint="step 0.1">
            <NumberInput defaultValue={0.2} step={0.1} />
          </Field>
          <Field label="Disabled">
            <NumberInput disabled defaultValue={5} />
          </Field>
        </div>
      </Row>
    </Rows>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Rows>
      <Row title="vertical — stacked stepper column">
        <div className="grid grid-cols-3 gap-6">
          <Field label="Quantity" required>
            <NumberInput orientation="vertical" defaultValue={5} min={0} max={10} />
          </Field>
          <Field label="Error" error="Out of range.">
            <NumberInput orientation="vertical" defaultValue={99} />
          </Field>
          <Field label="Small">
            <NumberInput orientation="vertical" size="sm" defaultValue={1} />
          </Field>
        </div>
      </Row>
    </Rows>
  ),
};
