import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, FileInput } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Inputs/FileInput',
  component: FileInput,
  tags: ['autodocs'],
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof FileInput>;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="browse — the attached panel opens the picker">
        <Field label="Document" hint="PDF up to 10 MB.">
          <FileInput accept="application/pdf" />
        </Field>
      </Row>
      <Row title="loading">
        <Field label="Uploading">
          <FileInput loading />
        </Field>
      </Row>
      <Row title="help marker — pressable when given onHelpClick">
        <Field label="With help">
          <FileInput onHelpClick={() => {}} />
        </Field>
      </Row>
      <Row title="disabled">
        <Field label="Disabled">
          <FileInput disabled />
        </Field>
      </Row>
    </Rows>
  ),
};
