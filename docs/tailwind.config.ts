import preset from "../tailwind.preset";

// The docs consume the library source, so the stylesheet is compiled here —
// scanned over both the source (the components' own classes) and the stories
// (the utilities their markup uses), over the same preset the package ships.
export default {
  content: ["../src/**/*.{ts,tsx}", "./stories/**/*.{ts,tsx}"],
  presets: [preset],
};
