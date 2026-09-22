import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, PasswordInput } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Inputs/PasswordInput',
  component: PasswordInput,
  tags: ['autodocs'],
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="the eye toggles visibility">
        <Field label="Password" required hint="At least 8 characters.">
          <PasswordInput defaultValue="s3cret!" autoComplete="current-password" />
        </Field>
      </Row>
      <Row title="disabled">
        <Field label="Password (disabled)">
          <PasswordInput disabled defaultValue="s3cret!" />
        </Field>
      </Row>
    </Rows>
  ),
};
