import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Textarea } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Inputs/Textarea',
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: 'Notes' },
};

export const SheetParity: Story = {
  render: () => (
    <Rows>
      <Row title="sheet parity — 128px at md and 110px at sm, both minimums">
        <div className="grid grid-cols-2 items-start gap-6">
          <Textarea placeholder="Notes (md)" />
          <Textarea size="sm" placeholder="Notes (sm)" />
        </div>
      </Row>
      <Row title="rows — native sizing instead of the sheet minimum">
        <Textarea rows={4} placeholder="Four rows" />
      </Row>
      <Row title="long content scrolls inside the sheet height">
        <Textarea defaultValue={Array.from({ length: 12 }, (_, i) => `Line ${i + 1}`).join('\n')} />
      </Row>
      <Row title="a stretched row — the field fills the height it is given">
        <div className="grid h-44">
          <Textarea size="sm" placeholder="In a stretched row" />
        </div>
      </Row>
    </Rows>
  ),
};

export const States: Story = {
  render: () => (
    <Rows>
      <Row title="error and disabled — the whole field fades, as the sheet draws it">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Error" error="Too long.">
            <Textarea defaultValue="Something invalid" />
          </Field>
          <Field label="Disabled">
            <Textarea disabled defaultValue="Not editable" />
          </Field>
        </div>
      </Row>
    </Rows>
  ),
};

export const Resize: Story = {
  render: () => (
    <Rows>
      <Row title="resize — vertical by default (the grip is the browser's, at the field's corner)">
        <div className="grid grid-cols-2 items-start gap-6">
          <Textarea resize="both" placeholder="Drag any direction" />
          <Textarea size="sm" resize="none" placeholder="No grip" />
        </div>
      </Row>
    </Rows>
  ),
};
