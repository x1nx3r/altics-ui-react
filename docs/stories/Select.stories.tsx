import { useArgs } from 'storybook/internal/preview-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Avatar, Field, Select, type SelectOption } from '../../src';
import { Row, Rows } from './kit';

const COUNTRIES: SelectOption[] = [
  { value: 'id', label: 'Indonesia', description: 'id' },
  { value: 'my', label: 'Malaysia', description: 'my' },
  { value: 'sg', label: 'Singapore', description: 'sg' },
  { value: 'th', label: 'Thailand', description: 'th', disabled: true },
];

const startsWith = (option: SelectOption, query: string) =>
  option.label.toLowerCase().startsWith(query.toLowerCase());

const meta = {
  title: 'Inputs/Select',
  component: Select,
  tags: ['autodocs'],
  args: {
    options: COUNTRIES,
    placeholder: 'Country',
  },
  argTypes: {
    size: { control: 'radio', options: ['sm', 'md', 'lg'] },
    // Function props: presets via mapping so every control stays clickable.
    filter: {
      control: 'select',
      options: ['Default', 'Starts with', 'Backend'],
      mapping: { Default: undefined, 'Starts with': startsWith, Backend: false },
    },
    footer: {
      control: 'select',
      options: ['Default', 'Custom', 'Hidden'],
      mapping: {
        Default: undefined,
        Custom: (
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs text-neutral-500">Pick your teams</span>
            <button type="button" className="text-sm font-semibold text-brand-secondary">
              Done
            </button>
          </div>
        ),
        Hidden: null,
      },
    },
    noResults: {
      control: 'select',
      options: ['Default', 'Custom'],
      mapping: {
        Default: undefined,
        Custom: <p className="px-6 py-8 text-center text-sm">Try another search.</p>,
      },
    },
    leading: {
      control: 'select',
      options: ['None', 'Dot', 'Avatar', 'Icon'],
      mapping: {
        None: undefined,
        Dot: <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />,
        Avatar: <Avatar fallback="ID" className="h-6 w-6 text-[10px]" />,
        Icon: <span aria-hidden="true">⌄</span>,
      },
    },
    clearIcon: {
      control: 'select',
      options: ['Default', 'Custom'],
      mapping: { Default: undefined, Custom: <span aria-hidden="true">×</span> },
    },
    // Internal plumbing, not consumer controls.
    platform: { table: { disable: true } },
    portalRoot: { table: { disable: true } },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof Select>;

/** Every control live: value, values, query and open stay controlled through
 * the panel, the rest flow straight into props. */
export const Playground: Story = {
  render: function Playground(args) {
    const [{ value, values, query, open }, updateArgs] = useArgs();
    return (
      <Select
        {...args}
        value={value as string | undefined}
        values={values as string[] | undefined}
        query={query as string | undefined}
        open={open as boolean | undefined}
        onValueChange={(next) => updateArgs({ value: next })}
        onValuesChange={(next) => updateArgs({ values: next })}
        onQueryChange={(next) => updateArgs({ query: next })}
        onOpenChange={(next) => updateArgs({ open: next })}
      />
    );
  },
  args: {
    multiple: false,
    searchable: false,
  },
};

export const Single: Story = {
  render: () => (
    <Rows>
      <Row title="controlled value — the trigger reads label plus description">
        <Select options={COUNTRIES} defaultValue="id" placeholder="Country" />
      </Row>
      <Row title="clearable — the mark sits 12/16/18 off the edge">
        <Select options={COUNTRIES} defaultValue="my" clearable />
      </Row>
      <Row title="allowDeselect off — re-choosing keeps the value">
        <Select options={COUNTRIES} defaultValue="id" allowDeselect={false} />
      </Row>
    </Rows>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Rows>
      <Row title="chips — incl. a fallback chip for a value the list lacks">
        <Select multiple chips options={COUNTRIES} defaultValues={['id', 'ghost']} />
      </Row>
      <Row title="maxSelectedValues 2 — further picks refuse silently">
        <Select multiple chips options={COUNTRIES} maxSelectedValues={2} />
      </Row>
      <Row title="footer — Reset empties, Select all fills to the cap">
        <Select multiple options={COUNTRIES} defaultValues={['id']} />
      </Row>
      <Row title="closeOnSelect — a multi that closes on pick">
        <Select multiple options={COUNTRIES} closeOnSelect />
      </Row>
    </Rows>
  ),
};

export const Searchable: Story = {
  render: () => (
    <Rows>
      <Row title="caret stays in the field — Enter chooses, Space types">
        <Select searchable options={COUNTRIES} defaultValue="sg" />
      </Row>
      <Row title="hideSelectedOptions — picked rows leave the list">
        <Select searchable multiple options={COUNTRIES} hideSelectedOptions />
      </Row>
      <Row title="renamed empty state — title, hint and action are props">
        <Select
          searchable
          options={COUNTRIES}
          noResultsTitle="Nothing here"
          noResultsHint="Loosen the filters."
          noResultsAction="Start over"
        />
      </Row>
      <Row title="Backspace drops the last chip on an empty field">
        <Select searchable multiple chips options={COUNTRIES} defaultValues={['id', 'my']} />
      </Row>
    </Rows>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Rows>
      <Row title="sm — 36 trigger, 14px label, 16 chevron">
        <Select size="sm" options={COUNTRIES} defaultValue="id" />
      </Row>
      <Row title="md — 40 trigger, 16px label">
        <Select size="md" options={COUNTRIES} defaultValue="id" />
      </Row>
      <Row title="lg — 44 trigger, 14px inset, 20 chevron">
        <Select size="lg" options={COUNTRIES} defaultValue="id" />
      </Row>
    </Rows>
  ),
};

export const States: Story = {
  render: () => (
    <Rows>
      <Row title="disabled, error, readOnly">
        <div className="grid grid-cols-1 gap-6">
          <Select options={COUNTRIES} disabled defaultValue="id" />
          <Select options={COUNTRIES} error="Choose a country" placeholder="Error" />
          <Select options={COUNTRIES} readOnly defaultValue="sg" />
        </div>
      </Row>
      <Row title="Field wiring — label, hint, required, error">
        <div className="grid grid-cols-1 gap-6">
          <Field label="Country" hint="Where the order ships.">
            <Select options={COUNTRIES} placeholder="Choose one" />
          </Field>
          <Field label="Country" required error="Choose a country">
            <Select options={COUNTRIES} />
          </Field>
        </div>
      </Row>
    </Rows>
  ),
};

const TEAMS_PAGE = (n: number): SelectOption[] =>
  Array.from({ length: 6 }, (_, i) => {
    const k = n * 6 + i + 1;
    return { value: `team-${k}`, label: `Team ${k}`, description: `t${k}` };
  });

function PagedDemo() {
  const [options, setOptions] = useState<SelectOption[]>(() => TEAMS_PAGE(0));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  return (
    <Select
      multiple
      searchable
      chips
      options={options}
      defaultValues={['team-9']}
      loading={loading}
      hasMore={hasMore}
      onLoadMore={() => {
        if (loading) return;
        setLoading(true);
        const next = page + 1;
        setTimeout(() => {
          setOptions((prev) => [...prev, ...TEAMS_PAGE(next)]);
          setPage(next);
          setLoading(false);
          if (next >= 2) setHasMore(false);
        }, 400);
      }}
      placeholder="Teams"
    />
  );
}

export const Async: Story = {
  render: () => (
    <Rows>
      <Row title="first load — the loading row replaces list and empty state">
        <Select searchable options={[]} loading loadingLabel="Fetching teams…" />
      </Row>
      <Row title="pagination — scroll the list, pages append under a loading row">
        <PagedDemo />
      </Row>
      <Row title="backend filtering — filter={false} renders the list as given">
        <Select searchable options={COUNTRIES} filter={false} />
      </Row>
    </Rows>
  ),
};

export const Leading: Story = {
  render: () => (
    <Rows>
      <Row title="per-option leading — avatar, dot, icon">
        <Select
          options={[
            {
              value: 'id',
              label: 'Indonesia',
              description: 'id',
              leading: <Avatar fallback="ID" className="h-6 w-6 text-[10px]" />,
            },
            {
              value: 'my',
              label: 'Malaysia',
              description: 'my',
              leading: <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />,
            },
            { value: 'sg', label: 'Singapore', description: 'sg' },
          ]}
          defaultValue="id"
        />
      </Row>
      <Row title="trigger leading — avatar before the value">
        <Select
          options={COUNTRIES}
          defaultValue="id"
          leading={<Avatar fallback="ID" className="h-6 w-6 text-[10px]" />}
        />
      </Row>
    </Rows>
  ),
};

export const DomainOptions: Story = {
  render: () => {
    const users = [
      { id: 1, name: 'Irfan Yulianto', team: 'Design' },
      { id: 2, name: 'Siti Rahma', team: 'Research' },
    ];
    return (
      <Rows>
        <Row title="domain records — getOptionValue/getOptionLabel derive identity and label">
          <Select
            searchable
            options={users}
            defaultValue="2"
            getOptionValue={(user) => String(user.id)}
            getOptionLabel={(user) => user.name}
          />
        </Row>
      </Rows>
    );
  },
};

export const ClassNames: Story = {
  render: () => (
    <Rows>
      <Row title="per-part classes merge over the sheet's own">
        <Select
          multiple
          options={COUNTRIES}
          defaultValues={['id']}
          classNames={{
            select: 'rounded-xl',
            search: 'bg-neutral-50',
            footer: 'px-6',
            'no-results': 'py-10',
          }}
        />
      </Row>
    </Rows>
  ),
};
