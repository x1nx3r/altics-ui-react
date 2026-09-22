import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, TagsInput } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Inputs/TagsInput',
  component: TagsInput,
  tags: ['autodocs'],
} satisfies Meta<typeof TagsInput>;

export default meta;
type Story = StoryObj<typeof TagsInput>;

export const SheetParity: Story = {
  render: () => (
    <Rows>
      <Row title="sheet parity — the Figma cell, md: Design + Marketing">
        <TagsInput placeholder="Add" defaultValue={['Design', 'Marketing']} />
      </Row>
      <Row title="sheet parity — sm">
        <TagsInput size="sm" placeholder="Add" defaultValue={['Design', 'Marketing']} />
      </Row>
      <Row title="sheet parity — lg">
        <TagsInput size="lg" placeholder="Add" defaultValue={['Design', 'Marketing']} />
      </Row>
      <Row title="sheet parity — empty, md">
        <TagsInput placeholder="Add" />
      </Row>
    </Rows>
  ),
};

export const Chips: Story = {
  render: () => (
    <Rows>
      <Row title="chips below — Enter or comma commits, Backspace removes">
        <Field label="Reviewers" hint="A comma-separated paste works too.">
          <TagsInput chips="below" placeholder="Add a reviewer" />
        </Field>
      </Row>
      <Row title="maxTags, error and disabled">
        <div className="grid grid-cols-3 gap-6">
          <Field label="Two at most">
            <TagsInput maxTags={2} defaultValue={['a', 'b']} />
          </Field>
          <Field label="Error" error="Too many tags.">
            <TagsInput error defaultValue={['a', 'b', 'c']} />
          </Field>
          <Field label="Disabled">
            <TagsInput disabled defaultValue={['a', 'b']} />
          </Field>
        </div>
      </Row>
    </Rows>
  ),
};

export const Multiline: Story = {
  render: () => (
    <Rows>
      <Row title="multiline — the sheets' textarea type, chips inside">
        <TagsInput multiline placeholder="Add a skill" defaultValue={['design system', 'react']} />
      </Row>
      <Row title="multiline, chips below">
        <TagsInput multiline chips="below" placeholder="Add a reviewer" defaultValue={['a', 'b']} />
      </Row>
    </Rows>
  ),
};

export const Overflow: Story = {
  render: () => (
    <Rows>
      <Row title="overflow scroll — the sheet height holds and the line scrolls">
        <Field label="Overflow (scroll)">
          <TagsInput
            overflow="scroll"
            placeholder="Add a skill"
            defaultValue={[
              'design system',
              'react',
              'typescript',
              'tailwind',
              'accessibility',
              'tokens',
              'figma',
              'storybook',
              'testing',
              'docs',
            ]}
          />
        </Field>
      </Row>
      <Row title="overflow wrap — the default, growing a row at a time">
        <Field label="Overflow (wrap)">
          <TagsInput
            defaultValue={[
              'design system',
              'react',
              'typescript',
              'tailwind',
              'accessibility',
              'tokens',
              'figma',
              'storybook',
              'testing',
              'docs',
            ]}
          />
        </Field>
      </Row>
    </Rows>
  ),
};
