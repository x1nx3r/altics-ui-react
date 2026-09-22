import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ActivityIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  HelpCircleIcon,
  Home01Icon,
  SearchLgIcon,
} from '../../src';
import { Icon } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Display/Icon',
  component: Icon,
  tags: ['autodocs'],
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof Icon>;

const GALLERY = [
  ['Home01Icon', Home01Icon],
  ['SearchLgIcon', SearchLgIcon],
  ['ActivityIcon', ActivityIcon],
  ['AlertCircleIcon', AlertCircleIcon],
  ['HelpCircleIcon', HelpCircleIcon],
  ['ChevronDownIcon', ChevronDownIcon],
] as const;

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="the generated set — 16px, tinted by the current colour">
        <div className="grid grid-cols-3 gap-6">
          {GALLERY.map(([name, Glyph]) => (
            <div key={name} className="flex items-center gap-3">
              <Glyph size={16} />
              <span className="text-xs text-neutral-600">{name}</span>
            </div>
          ))}
        </div>
      </Row>
      <Row title="size and colour follow the caller">
        <div className="flex items-center gap-6 text-red-600">
          <AlertCircleIcon size={16} />
          <AlertCircleIcon size={24} />
          <AlertCircleIcon size={32} />
        </div>
      </Row>
      <Row title="adding icons — regenerate with npm run generate:icons">
        <span className="text-xs text-neutral-600">
          The set is generated from the design's icon sources; never hand-edit.
        </span>
      </Row>
    </Rows>
  ),
};
