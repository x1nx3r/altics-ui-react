import { useMemo, useState, type ComponentType } from "react";
import "@altics/ui/styles.css";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Field,
  Input,
  Label,
  SearchLgIcon,
  Separator,
  Skeleton,
  Spinner,
  Stack,
  Textarea,
} from "@altics/ui";
import * as UI from "@altics/ui";

type IconComponent = ComponentType<{ size?: number }>;

const ALL_ICONS: { name: string; El: IconComponent }[] = Object.entries(UI)
  .filter(
    ([key, value]) =>
      key !== "Icon" && key.endsWith("Icon") && typeof value === "function",
  )
  .map(([key, value]) => ({ name: key, El: value as IconComponent }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function App({
  dark,
  onToggleDark,
}: {
  dark: boolean;
  onToggleDark: () => void;
}) {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState(24);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICONS;
    return ALL_ICONS.filter((i) => i.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <main className="min-h-screen bg-background py-5xl text-foreground">
      <Container>
        <Stack>
          <div className="flex flex-wrap items-center gap-md">
            <h1 className="text-2xl font-bold">
              Scratchpad — {ALL_ICONS.length} icons
            </h1>
            <Badge variant="secondary">{dark ? "dark" : "light"}</Badge>
            <span className="flex-1" />
            <Button variant="secondary" size="sm" onClick={onToggleDark}>
              Toggle theme
            </Button>
          </div>

          <div className="rounded-4xl bg-primary p-xxs text-primary-foreground">
            preset check: p-xxs + rounded-4xl (only exist via preset)
          </div>

          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Field + Input</h2>
              <Badge variant="secondary">new primitive</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Field
                  label="Email address"
                  required
                  hint="We never share your email."
                >
                  <Input
                    leading={<SearchLgIcon size={16} />}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Website">
                  <Input
                    leading="https://"
                    divider={{ leading: true }}
                    placeholder="example.com"
                  />
                </Field>
                <Field label="Amount">
                  <Input leading="Rp" placeholder="0" inputMode="numeric" />
                </Field>
                <Field label="Email" error="Enter a valid email address.">
                  <Input defaultValue="not-an-email" />
                </Field>
                <div className="flex items-end gap-md">
                  <Field label="Small">
                    <Input size="sm" placeholder="sm" />
                  </Field>
                  <Field label="Large">
                    <Input size="lg" placeholder="lg" />
                  </Field>
                  <Field label="Disabled">
                    <Input disabled defaultValue="off" />
                  </Field>
                </div>
              </Stack>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Icon gallery</h2>
              <Badge variant="secondary">
                {filtered.length} / {ALL_ICONS.length}
              </Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                <div className="flex flex-wrap items-center gap-md">
                  <Input
                    placeholder="Search icons… (e.g. arrow, home, box)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <label className="inline-flex items-center gap-md text-sm">
                    Size {size}
                    <input
                      className="accent-primary"
                      type="range"
                      min={16}
                      max={48}
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                    />
                  </label>
                </div>
                {filtered.length === 0 ? (
                  <Alert>No icons match “{query}”.</Alert>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-md">
                    {filtered.map(({ name, El }) => (
                      <span
                        key={name}
                        title={name}
                        className="inline-flex flex-col items-center gap-sm rounded-md border border-border px-xs py-lg text-center text-[11px] break-all"
                      >
                        <El size={size} />
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </Stack>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Buttons</h2>
              <Badge>Preview</Badge>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap gap-md">
                <Button>Primary</Button>
                <Button loading variant="secondary">
                  Saving
                </Button>
                <Button disabled variant="secondary">
                  Disabled
                </Button>
                <Button variant="tertiary">Tertiary</Button>
                {/* no destructive variant ships yet; see the gap noted in the input plan */}
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Form</h2>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Label>Email</Label>
                <Input placeholder="Email address" />
                <Textarea placeholder="Message" />
              </Stack>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Display</h2>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Alert>Accessible, token-based components.</Alert>
                <div className="flex items-center gap-md">
                  <Avatar fallback="AU" alt="Altics user" />
                  <Spinner />
                  <Skeleton className="h-4xl w-48" />
                </div>
                <Separator />
              </Stack>
            </Card.Content>
          </Card>
        </Stack>
      </Container>
    </main>
  );
}
