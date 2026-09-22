import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof Avatar>;

const PHOTO =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%23404860'/><circle cx='40' cy='30' r='14' fill='%23a5b4d0'/><path d='M12 80c2-20 14-28 28-28s26 8 28 28z' fill='%23a5b4d0'/></svg>";

export const Default: Story = {
  render: () => (
    <Rows>
      <Row title="fallback initials — no image given">
        <Avatar fallback="JD" alt="Jane Doe" />
      </Row>
      <Row title="with an image">
        <Avatar src={PHOTO} alt="Jane Doe" />
      </Row>
      <Row title="in a group">
        <div className="flex -space-x-2">
          <Avatar fallback="JD" alt="Jane Doe" />
          <Avatar fallback="RS" alt="Rafi Setiawan" />
          <Avatar fallback="AL" alt="Ayu Lestari" />
        </div>
      </Row>
    </Rows>
  ),
};
