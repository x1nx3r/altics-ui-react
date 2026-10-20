import "@altics/ui/styles.css";
import {
  Badge,
  Card,
  ChevronDownIcon,
  Container,
  Field,
  FileInput,
  Input,
  NumberInput,
  OtpInput,
  PasswordInput,
  PinInput,
  SearchLgIcon,
  Stack,
  TagsInput,
  Textarea,
  cn,
} from "@altics/ui";
import { cn as appCn } from "../lib/cn";

type Size = "sm" | "md" | "lg";
const SIZES: Size[] = ["sm", "md", "lg"];

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-xs text-xs font-semibold opacity-70">{title}</p>
      {children}
    </div>
  );
}

export default function InputShowcase({
  dark,
  onToggleDark,
}: {
  dark: boolean;
  onToggleDark: () => void;
}) {

  return (
    <main className="min-h-screen bg-background py-5xl text-foreground">
      <Container>
        <Stack gap="lg">
          <div className="flex flex-wrap items-center gap-md">
            <h1 className="text-2xl font-bold">Input showcase</h1>
            <a href="/" className="text-sm">
              ← home
            </a>
            <span className="flex-1" />
            <button className="text-sm" onClick={onToggleDark}>
              {dark ? "🌙 dark" : "☀️ light"}
            </button>
          </div>

          {/* ---- Sizes × states, plain ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Sizes × states (plain)</h2>
            </Card.Header>
            <Card.Content>
              <Stack>
                {SIZES.map((s) => (
                  <Row key={s} title={`size=${s}`}>
                    <div className="grid grid-cols-4 gap-lg">
                      <Input size={s} placeholder="Placeholder" />
                      <Input size={s} defaultValue="Filled" />
                      <Input size={s} defaultValue="Focused" autoFocus />
                      <Input size={s} defaultValue="Disabled" disabled />
                    </div>
                  </Row>
                ))}
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- Destructive: box only ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Destructive (box only)</h2>
              <Badge variant="secondary">Input error</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                {SIZES.map((s) => (
                  <Row key={s} title={`size=${s}`}>
                    <div className="grid grid-cols-3 gap-lg">
                      <Input size={s} error placeholder="Placeholder" />
                      <Input size={s} error defaultValue="Filled" />
                      <Input size={s} error defaultValue="Focused" autoFocus />
                    </div>
                  </Row>
                ))}
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- Destructive: full Field treatment ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Destructive (Field)</h2>
              <Badge variant="secondary">message + aria-describedby</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                {SIZES.map((s) => (
                  <Row key={s} title={`size=${s}`}>
                    <div className="grid grid-cols-3 gap-lg">
                      <Field label="Email" required error="Enter a valid email address.">
                        <Input size={s} placeholder="Placeholder" />
                      </Field>
                      <Field label="Email" required error="Enter a valid email address.">
                        <Input size={s} defaultValue="nope" />
                      </Field>
                      <Field label="Email" required error="Enter a valid email address.">
                        <Input size={s} defaultValue="nope" autoFocus />
                      </Field>
                    </div>
                  </Row>
                ))}
                <Row title="hint replaced by error">
                  <div className="grid grid-cols-2 gap-lg">
                    <Field label="Email" hint="We never share your email.">
                      <Input placeholder="you@example.com" />
                    </Field>
                    <Field
                      label="Email"
                      hint="We never share your email."
                      error="Enter a valid email address."
                    >
                      <Input defaultValue="nope" />
                    </Field>
                  </div>
                </Row>
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- Field assembly (label/required/hint/error) ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Field assembly</h2>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 gap-3xl">
                <Field label="Email" required hint="We never share it.">
                  <Input placeholder="you@example.com" />
                </Field>
                <Field label="Email" required error="Not a valid address.">
                  <Input defaultValue="nope" />
                </Field>
                <Field label="Disabled">
                  <Input disabled defaultValue="off" />
                </Field>
                <Field label="Hint only">
                  <Input placeholder="…" />
                </Field>
              </div>
            </Card.Content>
          </Card>

          {/* ---- Affix / slot combos ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Affixes & dividers</h2>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Row title="leading icon (no divider)">
                  <Input leading={<SearchLgIcon size={16} />} placeholder="Search…" />
                </Row>
                <Row title="leading text, no divider (money)">
                  <Input leading="Rp" inputMode="numeric" placeholder="0" />
                </Row>
                <Row title="leading text + divider (website)">
                  <Input
                    leading="https://"
                    divider={{ leading: true }}
                    placeholder="example.com"
                  />
                </Row>
                <Row title="trailing dropdown, no divider">
                  <Input
                    trailing={
                      <select
                        aria-label="Currency"
                        className="bg-transparent text-sm outline-none"
                        defaultValue="USD"
                      >
                        <option>USD</option>
                        <option>IDR</option>
                        <option>EUR</option>
                      </select>
                    }
                    placeholder="1,000.00"
                  />
                </Row>
                <Row title="both text affixes, divider trailing only">
                  <Input
                    leading="Rp"
                    trailing="IDR"
                    divider={{ trailing: true }}
                    defaultValue="25,000"
                  />
                </Row>
                <Row title="icon both sides">
                  <Input
                    leading={<SearchLgIcon size={16} />}
                    trailing={<ChevronDownIcon size={16} />}
                    placeholder="Both"
                  />
                </Row>
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- Textarea ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Textarea</h2>
              <Badge variant="secondary">Textarea</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Row title="sizes — 128px at md, 110px at sm, both a minimum">
                  <div className="grid grid-cols-2 items-start gap-3xl">
                    <Textarea placeholder="Notes (md)" />
                    <Textarea size="sm" placeholder="Notes (sm)" />
                  </div>
                </Row>
                <Row title="rows — native sizing instead of the sheet minimum">
                  <Textarea rows={4} placeholder="Four rows" />
                </Row>
                <Row title="long content scrolls inside the sheet height">
                  <Textarea
                    defaultValue={Array.from({ length: 12 }, (_, i) => `Line ${i + 1}`).join("\n")}
                  />
                </Row>
                <Row title="error and disabled — the whole field fades, as the sheet draws it">
                  <div className="grid grid-cols-2 gap-3xl">
                    <Field label="Error" error="Too long.">
                      <Textarea defaultValue="Something invalid" />
                    </Field>
                    <Field label="Disabled">
                      <Textarea disabled defaultValue="Not editable" />
                    </Field>
                  </div>
                </Row>
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- className overrides (cn merge) ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">className overrides</h2>
              <Badge variant="secondary">cn merge</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Row title="height — the override replaces the box's own h-10">
                  <div className="grid grid-cols-3 items-end gap-lg">
                    <Input placeholder="default (40)" />
                    <Input className="h-16" placeholder="h-16 (64)" />
                    <Input className="h-8" placeholder="h-8 (32)" />
                  </div>
                </Row>
                <Row title="text size — text-lg replaces the box's text-base">
                  <div className="grid grid-cols-2 items-end gap-lg">
                    <Input placeholder="default (16)" />
                    <Input className="text-lg" placeholder="text-lg (18)" />
                  </div>
                </Row>
                <Row title="token override — gap-md replaced by gap-3xl, both token classes">
                  <div className="grid grid-cols-2 gap-lg">
                    <Field label="Email">
                      <Input placeholder="gap-md (8)" />
                    </Field>
                    <Field label="Email" className="gap-3xl">
                      <Input placeholder="gap-3xl (24)" />
                    </Field>
                  </div>
                </Row>
                <Row title="textarea — the box grows and the textarea fills it">
                  <div className="grid grid-cols-2 items-start gap-lg">
                    <Textarea placeholder="default 128" />
                    <Textarea className="h-64" placeholder="h-64 (256)" />
                  </div>
                </Row>
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- Consumer tokens (createCn) ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Consumer tokens</h2>
              <Badge variant="secondary">createCn</Badge>
            </Card.Header>
            <Card.Content>
              <Row title="the app's own token (gap-brand, 56) through the app's merge, defined once in src/lib/cn — the library's instance has never seen the name">
                <div className="grid grid-cols-2 gap-lg">
                  <div className={cn("flex flex-col gap-2")}>
                    <div className="rounded-sm border border-border p-1 text-xs">gap-2 = 8</div>
                    <div className="rounded-sm border border-border p-1 text-xs">one</div>
                  </div>
                  <div className={appCn("flex flex-col gap-2", "gap-brand")}>
                    <div className="rounded-sm border border-border p-1 text-xs">gap-brand = 56</div>
                    <div className="rounded-sm border border-border p-1 text-xs">one</div>
                  </div>
                </div>
              </Row>
            </Card.Content>
          </Card>

          {/* ---- Password ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Password</h2>
              <Badge variant="secondary">PasswordInput</Badge>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 gap-3xl">
                <Field label="Password" required hint="At least 8 characters.">
                  <PasswordInput defaultValue="s3cret!" autoComplete="current-password" />
                </Field>
                <Field label="Password (disabled)">
                  <PasswordInput disabled defaultValue="s3cret!" />
                </Field>
              </div>
            </Card.Content>
          </Card>
          {/* ---- Number ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Number</h2>
              <Badge variant="secondary">NumberInput</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Row title="horizontal — steppers at each end">
                  <div className="grid grid-cols-3 gap-lg">
                    <Field label="Quantity">
                      <NumberInput defaultValue={5} min={0} max={10} />
                    </Field>
                    <Field label="Price" hint="step 0.1">
                      <NumberInput defaultValue={0.2} step={0.1} />
                    </Field>
                    <Field label="Disabled">
                      <NumberInput disabled defaultValue={5} />
                    </Field>
                  </div>
                </Row>
                <Row title="vertical — stacked stepper column">
                  <div className="grid grid-cols-3 gap-lg">
                    <Field label="Quantity" required>
                      <NumberInput orientation="vertical" defaultValue={5} min={0} max={10} />
                    </Field>
                    <Field label="Error" error="Out of range.">
                      <NumberInput orientation="vertical" defaultValue={99} />
                    </Field>
                    <Field label="Small">
                      <NumberInput orientation="vertical" size="sm" defaultValue={1} />
                    </Field>
                  </div>
                </Row>
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- File ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">File</h2>
              <Badge variant="secondary">FileInput</Badge>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 gap-3xl">
                <Field label="Document" hint="PDF up to 10 MB.">
                  <FileInput accept="application/pdf" />
                </Field>
                <Field label="Uploading">
                  <FileInput loading />
                </Field>
                <Field label="With help">
                  <FileInput onHelpClick={() => {}} />
                </Field>
                <Field label="Disabled">
                  <FileInput disabled />
                </Field>
              </div>
            </Card.Content>
          </Card>

          {/* ---- OTP ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">One-time code</h2>
              <Badge variant="secondary">OtpInput</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Row title="four cells — type, backspace, or paste a code">
                  <OtpInput />
                </Row>
                <Row title="sizes — the field ramp">
                  <div className="flex items-end gap-lg">
                    <OtpInput size="sm" defaultValue="12" />
                    <OtpInput size="md" defaultValue="34" />
                    <OtpInput size="lg" defaultValue="56" />
                  </div>
                </Row>
                <Row title="six cells, error and disabled">
                  <div className="grid grid-cols-3 gap-3xl">
                    <Field label="Six digits">
                      <OtpInput length={6} />
                    </Field>
                    <Field label="Wrong code" error="That code has expired.">
                      <OtpInput defaultValue="1234" error />
                    </Field>
                    <Field label="Disabled">
                      <OtpInput disabled defaultValue="12" />
                    </Field>
                  </div>
                </Row>
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- Pin ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Pin</h2>
              <Badge variant="secondary">PinInput</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Row title="sheet parity — empty cells at sm / md / lg (the sheet's one state)">
                  <div className="flex items-end gap-3xl">
                    <PinInput size="sm" />
                    <PinInput size="md" />
                    <PinInput size="lg" />
                  </div>
                </Row>
                <Row title="sheet parity — typed digits at sm / md / lg">
                  <div className="flex items-end gap-3xl">
                    <PinInput size="sm" defaultValue="12" />
                    <PinInput size="md" defaultValue="34" />
                    <PinInput size="lg" defaultValue="56" />
                  </div>
                </Row>
                <Row title="custom placeholder — the sheet draws a 0">
                  <PinInput placeholder="·" />
                </Row>
                <Row title="six cells, error and disabled">
                  <div className="grid grid-cols-3 gap-3xl">
                    <Field label="Six digits">
                      <PinInput length={6} />
                    </Field>
                    <Field label="Wrong code" error="That code has expired.">
                      <PinInput defaultValue="1234" error />
                    </Field>
                    <Field label="Disabled">
                      <PinInput disabled defaultValue="12" />
                    </Field>
                  </div>
                </Row>
              </Stack>
            </Card.Content>
          </Card>

          {/* ---- Tags ---- */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-semibold">Tags</h2>
              <Badge variant="secondary">TagsInput</Badge>
            </Card.Header>
            <Card.Content>
              <Stack>
                <Row title="a long tag is capped and ellipsised, never breaking the border">
                  <TagsInput
                    defaultValue={[
                      "https://example.com/a/really/long/path/that/nobody/would/ever/type/by/hand/but/a/paste/puts/it/here/verbatim?with=query&and=more&and=more&and=even&more=params",
                      "ok",
                    ]}
                  />
                </Row>
                <Row title="sheet parity — the Figma cell, md: 'Design' + 'Marketing'">
                  <TagsInput placeholder="Add" defaultValue={["Design", "Marketing"]} />
                </Row>
                <Row title="sheet parity — sm">
                  <TagsInput size="sm" placeholder="Add" defaultValue={["Design", "Marketing"]} />
                </Row>
                <Row title="sheet parity — lg">
                  <TagsInput size="lg" placeholder="Add" defaultValue={["Design", "Marketing"]} />
                </Row>
                <Row title="sheet parity — empty, md">
                  <TagsInput placeholder="Add" />
                </Row>
                <Row title="chips inside — Enter or comma commits, Backspace removes">
                  <Field label="Skills" hint="Press Enter after each one.">
                    <TagsInput
                      placeholder="Add a skill"
                      defaultValue={["design system", "react"]}
                    />
                  </Field>
                </Row>
                <Row title="chips below">
                  <Field label="Reviewers" hint="A comma-separated paste works too.">
                    <TagsInput chips="below" placeholder="Add a reviewer" />
                  </Field>
                </Row>
                <Row title="multiline — the sheets' textarea type, chips inside">
                  <TagsInput
                    multiline
                    placeholder="Add a skill"
                    defaultValue={["design system", "react"]}
                  />
                </Row>
                <Row title="multiline, chips below">
                  <TagsInput
                    multiline
                    chips="below"
                    placeholder="Add a reviewer"
                    defaultValue={["a", "b"]}
                  />
                </Row>
                <Row title="maxTags, error and disabled">
                  <div className="grid grid-cols-3 gap-3xl">
                    <Field label="Two at most">
                      <TagsInput maxTags={2} defaultValue={["a", "b"]} />
                    </Field>
                    <Field label="Error" error="Too many tags.">
                      <TagsInput error defaultValue={["a", "b", "c"]} />
                    </Field>
                    <Field label="Disabled">
                      <TagsInput disabled defaultValue={["a", "b"]} />
                    </Field>
                  </div>
                </Row>
                <Row title="many tags — scroll (overflow='scroll')">
                  <Field label="Overflow (scroll)">
                    <TagsInput
                      overflow="scroll"
                      placeholder="Add a skill"
                      defaultValue={[
                        "design system",
                        "react",
                        "typescript",
                        "tailwind",
                        "accessibility",
                        "tokens",
                        "figma",
                        "storybook",
                        "testing",
                        "docs",
                      ]}
                    />
                  </Field>
                </Row>
                <Row title="many tags — inside (overflow check)">
                  <Field label="Overflow">
                    <TagsInput
                      defaultValue={[
                        "design system",
                        "react",
                        "typescript",
                        "tailwind",
                        "accessibility",
                        "tokens",
                        "figma",
                        "storybook",
                        "testing",
                        "docs",
                      ]}
                    />
                  </Field>
                </Row>
              </Stack>
            </Card.Content>
          </Card>
        </Stack>
      </Container>
    </main>
  );
}
