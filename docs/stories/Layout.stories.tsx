import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container, Grid, Stack, Text } from '../../src';
import { Row, Rows } from './kit';

const meta = {
  title: 'Layout/Layout',
  component: Stack,
  subcomponents: { Grid, Container },
  tags: ['autodocs'],
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof Stack>;

export const Stack_: Story = {
  render: () => (
    <Row title="Stack — vertical rhythm, gap sm / md / lg">
      <Stack gap="sm">
        <div className="rounded-sm border border-border p-2"><Text size="tsm">sm — 8px apart</Text></div>
        <div className="rounded-sm border border-border p-2"><Text size="tsm">sm — 8px apart</Text></div>
      </Stack>
      <Stack gap="lg">
        <div className="rounded-sm border border-border p-2"><Text size="tsm">lg — 24px apart</Text></div>
        <div className="rounded-sm border border-border p-2"><Text size="tsm">lg — 24px apart</Text></div>
      </Stack>
    </Row>
  ),
};

export const Grid_: Story = {
  render: () => (
    <Row title="Grid — columns 1 to 4, 16px gutters">
      <Grid columns={3}>
        {['One', 'Two', 'Three'].map((label) => (
          <div key={label} className="rounded-sm border border-border p-2">
            <Text size="tsm">{label}</Text>
          </div>
        ))}
      </Grid>
    </Row>
  ),
};

export const Container_: Story = {
  render: () => (
    <Rows>
      <Row title="Container — centres the page at max-w-7xl with the responsive gutters">
        <Container>
          <div className="rounded-sm border border-border p-2">
            <Text size="tsm">The page body.</Text>
          </div>
        </Container>
      </Row>
    </Rows>
  ),
};
