import { Text } from "./Text";

export function TextExamples() {
  return (
    <div className="space-y-8 p-6">
      {/* Variants */}
      <div>
        <Text className="text-2xl font-bold mb-4">Variants</Text>
        <div className="space-y-2">
          <Text variant="body">Body text - Default paragraph style</Text>
          <Text variant="caption">Caption text - Small supporting text</Text>
          <Text variant="label">Label - Form and UI labels</Text>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <Text className="text-2xl font-bold mb-4">Sizes</Text>
        <div className="space-y-2">
          <Text size="txxs">Text xxs</Text>
          <Text size="txs">Text xs</Text>
          <Text size="tsm">Text sm</Text>
          <Text size="tlg">Text lg</Text>
          <Text size="txl">Text xl</Text>
          <Text size="xs">Display xs</Text>
          <Text size="sm">Display sm</Text>
          <Text size="md">Display md</Text>
          <Text size="lg">Display lg</Text>
          <Text size="xl">Display xl</Text>
          <Text size="2xl">Display 2xl</Text>
        </div>
      </div>

      {/* Weights */}
      <div>
        <Text className="text-2xl font-bold mb-4">Weights</Text>
        <div className="space-y-2">
          <Text weight="regular">Regular weight - Default</Text>
          <Text weight="medium">Medium weight</Text>
          <Text weight="semibold">Semibold weight</Text>
          <Text weight="bold">Bold weight</Text>
        </div>
      </div>

      {/* Colors - Text */}
      <div>
        <Text className="text-2xl font-bold mb-4">Text Colors</Text>
        <div className="space-y-2">
          <Text color="primary">Primary text</Text>
          <Text color="secondary">Secondary text</Text>
          <Text color="tertiary">Tertiary text</Text>
          <Text color="quaternary">Quaternary text</Text>
          <Text color="disabled">Disabled text</Text>
          <Text color="white" className="bg-primary-900 p-2">White text on dark</Text>
          <Text color="inverse">Inverse text</Text>
        </div>
      </div>

      {/* Colors - Semantic */}
      <div>
        <Text className="text-2xl font-bold mb-4">Semantic Colors</Text>
        <div className="space-y-2">
          <Text color="error">Error message text</Text>
          <Text color="warning">Warning message text</Text>
          <Text color="success">Success message text</Text>
        </div>
      </div>

      {/* Colors - Brand */}
      <div>
        <Text className="text-2xl font-bold mb-4">Brand Colors</Text>
        <div className="space-y-2">
          <Text color="brand-primary">Brand primary text</Text>
          <Text color="brand-secondary">Brand secondary text</Text>
          <Text color="brand-tertiary">Brand tertiary text</Text>
        </div>
      </div>

      {/* Link Colors */}
      <div>
        <Text className="text-2xl font-bold mb-4">Link Colors</Text>
        <div className="space-y-2">
          <Text color="link">Link text</Text>
          <Text color="link-hover">Link hover text</Text>
        </div>
      </div>

      {/* Truncation */}
      <div>
        <Text className="text-2xl font-bold mb-4">Truncation</Text>
        <div className="space-y-4">
          <div className="w-64">
            <Text truncate>
              This is a very long text that will be truncated with an ellipsis when it exceeds the container width
            </Text>
          </div>
          <div className="w-64">
            <Text lines={2}>
              This is a very long text that will be truncated after two lines with an ellipsis when it exceeds the container width
            </Text>
          </div>
        </div>
      </div>

      {/* Text Transform */}
      <div>
        <Text className="text-2xl font-bold mb-4">Text Transform</Text>
        <div className="space-y-2">
          <Text uppercase>this text is uppercase</Text>
          <Text lowercase>THIS TEXT IS LOWERCASE</Text>
          <Text capitalize>this text is capitalized</Text>
        </div>
      </div>

      {/* Combinations */}
      <div>
        <Text className="text-2xl font-bold mb-4">Combinations</Text>
        <div className="space-y-4">
          <Text  color="brand-primary" weight="bold">
            Bold Brand Heading
          </Text>
          <Text variant="body" size="lg" color="secondary">
            Large secondary body text
          </Text>
          <Text variant="caption" color="error" weight="semibold">
            Semibold error caption
          </Text>
          <div className="w-48">
            <Text variant="label" truncate color="tertiary">
              Truncated label with tertiary color
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
