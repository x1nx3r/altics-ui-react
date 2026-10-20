import { useState } from "react";
import { Avatar, Field, SearchLgIcon } from "@altics/ui";
import { Select, type SelectOption } from "../../../src/components/select";

/**
 * The select family's full capability surface, one live section per feature.
 * SheetParity proves geometry; this page proves behaviour — every prop that
 * changes what the component does has a working control here.
 */

const COUNTRIES: SelectOption[] = [
  { value: "id", label: "Indonesia", description: "id" },
  { value: "my", label: "Malaysia", description: "my" },
  { value: "sg", label: "Singapore", description: "sg" },
  { value: "th", label: "Thailand", description: "th", disabled: true },
];

type User = { id: number; name: string; team: string };
const USERS: User[] = [
  { id: 1, name: "Irfan Yulianto", team: "Design" },
  { id: 2, name: "Siti Rahma", team: "Research" },
  { id: 3, name: "Budi Santoso", team: "Platform" },
];

const TEAMS_PAGE = (n: number): SelectOption[] =>
  Array.from({ length: 6 }, (_, i) => {
    const k = n * 6 + i + 1;
    return { value: `team-${k}`, label: `Team ${k}`, description: `t${k}` };
  });

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="grid max-w-3xl gap-4">{children}</div>
    </section>
  );
}

function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="w-[320px]">
      <p className="mb-1 text-[11px] text-neutral-400">{label}</p>
      {children}
    </div>
  );
}

function Single() {
  const [value, setValue] = useState("id");
  return (
    <Section title="Single select">
      <Demo label="controlled value + onValueChange">
        <Select options={COUNTRIES} value={value} onValueChange={setValue} />
        <p className="mt-1 text-xs text-neutral-500">value: {value}</p>
      </Demo>
      <Demo label="clearable">
        <Select options={COUNTRIES} defaultValue="my" clearable />
      </Demo>
      <Demo label="sm / lg sizes">
        <div className="flex flex-col gap-2">
          <Select options={COUNTRIES} size="sm" placeholder="Small" />
          <Select options={COUNTRIES} size="lg" placeholder="Large" />
        </div>
      </Demo>
      <Demo label="disabled, error, readOnly">
        <div className="flex flex-col gap-2">
          <Select options={COUNTRIES} disabled defaultValue="id" />
          <Select options={COUNTRIES} error="Choose a country" placeholder="Error" />
          <Select options={COUNTRIES} readOnly defaultValue="sg" />
        </div>
      </Demo>
    </Section>
  );
}

function Multiple() {
  const [values, setValues] = useState<string[]>(["id", "ghost"]);
  return (
    <Section title="Multiple select">
      <Demo label="chips, incl. a fallback chip for an unloaded value">
        <Select multiple chips options={COUNTRIES} values={values} onValuesChange={setValues} />
        <p className="mt-1 text-xs text-neutral-500">values: {values.join(", ")}</p>
      </Demo>
      <Demo label="maxSelectedValues = 2">
        <Select multiple chips options={COUNTRIES} maxSelectedValues={2} />
      </Demo>
      <Demo label="custom footer slot">
        <Select
          multiple
          options={COUNTRIES}
          footer={
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-xs text-neutral-500">Pick your teams</span>
              <button type="button" className="text-sm font-semibold text-brand-secondary">
                Done
              </button>
            </div>
          }
        />
      </Demo>
      <Demo label="footer wired to backend triggers">
        <Select
          multiple
          options={COUNTRIES}
          onSelectAll={() => alert("POST /teams/select-all")}
          onReset={() => alert("POST /teams/reset")}
        />
      </Demo>
    </Section>
  );
}

function Searchable() {
  const [query, setQuery] = useState("sin");
  return (
    <Section title="Searchable">
      <Demo label="type to filter — caret stays in the field, Enter chooses">
        <Select searchable options={COUNTRIES} defaultValue="sg" />
      </Demo>
      <Demo label="controlled query">
        <Select searchable options={COUNTRIES} query={query} onQueryChange={setQuery} />
        <p className="mt-1 text-xs text-neutral-500">query: {query}</p>
      </Demo>
      <Demo label="custom starts-with filter">
        <Select
          searchable
          options={COUNTRIES}
          filter={(option, text) =>
            option.label.toLowerCase().startsWith(text.toLowerCase())
          }
        />
      </Demo>
      <Demo label="renamed empty state">
        <Select
          searchable
          options={COUNTRIES}
          noResultsTitle="Nothing here"
          noResultsHint="Loosen the filters."
          noResultsAction="Start over"
        />
      </Demo>
    </Section>
  );
}

function DomainOptions() {
  const [value, setValue] = useState("2");
  return (
    <Section title="Domain-shaped options">
      <Demo label="getOptionValue / getOptionLabel over backend records">
        <Select
          searchable
          options={USERS}
          value={value}
          onValueChange={setValue}
          getOptionValue={(user) => String(user.id)}
          getOptionLabel={(user) => user.name}
          leading={<Avatar fallback="TM" alt="Team" className="h-6 w-6 text-[10px]" />}
        />
        <p className="mt-1 text-xs text-neutral-500">value: {value}</p>
      </Demo>
    </Section>
  );
}

function Async() {
  const [options, setOptions] = useState<SelectOption[]>(() => TEAMS_PAGE(0));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const loadMore = () => {
    if (loading) return;
    setLoading(true);
    const next = page + 1;
    setTimeout(() => {
      setOptions((prev) => [...prev, ...TEAMS_PAGE(next)]);
      setPage(next);
      setLoading(false);
      if (next >= 9) setHasMore(false);
    }, 400);
  };

  return (
    <Section title="Async + paginated backend">
      <Demo label="scroll the list — 10 pages append under a loading row">
        <Select
          multiple
          searchable
          chips
          options={options}
          defaultValues={["team-9"]}
          loading={loading}
          onLoadMore={loadMore}
          hasMore={hasMore}
          placeholder="Teams"
        />
        <p className="mt-1 text-xs text-neutral-500">
          page {page + 1}/10 · loaded: {options.length} rows ·{" "}
          {hasMore ? "more pages" : "exhausted"}
        </p>
      </Demo>
      <Demo label="first load">
        <Select searchable options={[]} loading loadingLabel="Fetching teams…" />
      </Demo>
    </Section>
  );
}

function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <Section title="Controlled open + Field wiring">
      <Demo label="open state owned by the caller">
        <Select options={COUNTRIES} open={open} onOpenChange={setOpen} />
        <p className="mt-1 text-xs text-neutral-500">open: {String(open)}</p>
      </Demo>
      <div className="w-[320px]">
        <p className="mb-1 text-[11px] text-neutral-400">label, hint, error</p>
        <Field label="Country" hint="Where the order ships.">
          <Select options={COUNTRIES} placeholder="Choose one" />
        </Field>
      </div>
      <div className="w-[320px]">
        <p className="mb-1 text-[11px] text-neutral-400">leading adornment + icon</p>
        <Select
          options={COUNTRIES}
          defaultValue="id"
          leading={<SearchLgIcon size={16} className="text-neutral-400" />}
        />
      </div>
    </Section>
  );
}

export default function SelectShowcase() {
  return (
    <div className="min-h-screen bg-background p-12">
      <h1 className="text-2xl font-bold">Select capabilities</h1>
      <p className="mb-10 mt-1 max-w-3xl text-sm text-neutral-500">
        Every behaviour the component owns, live. Single and multiple, chips and
        counts, search with the caret held, domain records, async pages, the
        footer, and the empty state.
      </p>
      <Single />
      <Multiple />
      <Searchable />
      <DomainOptions />
      <Async />
      <Controlled />
    </div>
  );
}
