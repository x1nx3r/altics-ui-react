import preset from "@altics/ui/tailwind-preset";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  presets: [preset],
  // A token of the consumer's own, the way an app's config would add one.
  theme: { extend: { spacing: { brand: "3.5rem" } } },
};
