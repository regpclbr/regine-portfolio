import { TOOLS } from "@/config/motion";
import type { Tool } from "@/data/tools";

/** Brand color softened slightly toward our warm ink so logos sit nicely on cream. */
export const softened = (color: string) => `color-mix(in srgb, ${color} ${100 - TOOLS.logoSoften}%, var(--color-ink))`;

/** Tool logo: react-icons glyph in its (softened) brand color, or a rounded monogram badge. */
export default function ToolLogo({ tool, size = 28 }: { tool: Tool; size?: number }) {
  if (tool.monogram) {
    return (
      <span
        aria-hidden="true"
        className="grid place-items-center rounded-[30%] font-sans font-bold text-white leading-none select-none"
        style={{ width: size, height: size, fontSize: size * (tool.monogram.text.length > 1 ? 0.42 : 0.55), background: tool.monogram.bg, filter: `saturate(${1 - TOOLS.logoSoften / 100})` }}
      >
        {tool.monogram.text}
      </span>
    );
  }
  const Icon = tool.icon!;
  return <Icon aria-hidden="true" size={size} style={{ color: softened(tool.iconColor ?? tool.brandColor) }} />;
}
