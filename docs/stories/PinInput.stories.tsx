import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, PinInput } from '../../src';

const meta = {
  title: 'Inputs/PinInput',
  component: PinInput,
  tags: ['autodocs'],
} satisfies Meta<typeof PinInput>;

export default meta;
type Story = StoryObj<typeof PinInput>;

export const Default: Story = {
  render: () => <PinInput />,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <PinInput size="sm" />
      <PinInput />
      <PinInput size="lg" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <PinInput defaultValue="1234" />
      <Field label="Wrong code" error="That code has expired.">
        <PinInput defaultValue="1234" error />
      </Field>
      <PinInput disabled />
    </div>
  ),
};
