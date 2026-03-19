import SandboxMap from "./SandboxMap";

export const metadata = {
  title: "deck.gl Sandbox",
  description: "Interactive map sandbox powered by deck.gl and MapLibre GL",
};

export default function SandboxPage() {
  return <SandboxMap />;
}
