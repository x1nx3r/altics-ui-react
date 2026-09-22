import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, OtpInput } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Inputs/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof OtpInput>;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="four cells — type, backspace, or paste a code">
        <OtpInput />
      </Row>
    </Rows>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Rows>
      <Row title="the field ramp — 36 / 40 / 44 cells on the 8px gap">
        <div className="flex items-end gap-6">
          <OtpInput size="sm" defaultValue="12" />
          <OtpInput defaultValue="34" />
          <OtpInput size="lg" defaultValue="56" />
        </div>
      </Row>
    </Rows>
  ),
};

export const States: Story = {
  render: () => (
    <Rows>
      <Row title="six cells, error and disabled">
        <div className="grid grid-cols-3 gap-6">
          <Field label="Six digits">
            <OtpInput length={6} />
          </Field>
          <Field label="Wrong code" error="That code has expired.">
            <OtpInput defaultValue="1234" error />
          </Field>
          <Field label="Disabled">
            <OtpInput disabled defaultValue="12" />
          </Field>
        </div>
      </Row>
    </Rows>
  ),
};
