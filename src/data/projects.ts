/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PORTFOLIO PROJECTS — the one array the carousel reads.
 *
 *  ADD A PROJECT
 *   1. Make a folder in  src/assets/portfolio/<folder>/  and drop your images in
 *      (PNG / JPG / WEBP). Recommended size: 1080 × 1350 px (4:5 portrait).
 *      Files are sorted naturally (1, 2, … 10); the first one is the card
 *      unless you set `cover: <index>`. All of them show in the detail view.
 *   2. Add one entry to PROJECTS below, e.g.
 *        {
 *          id: "my-project",
 *          title: "My Project",
 *          subtitle: "Social Media Graphics · Client Name",
 *          category: "Social Media",          // "Social Media" | "Graphics" | "Admin Systems"
 *          type: "image",                     // or "video" (see below)
 *          images: fromFolder("<folder>", "Alt text for screen readers"),
 *          description: "One or two sentences about the work.",
 *          tools: ["Canva"],
 *          results: ["12 posts delivered"],   // optional — defaults to “N designs delivered”
 *        },
 *   3. Optional: run  pnpm optimize:images  to make lightweight card versions in
 *      src/assets/portfolio-thumbs/ (originals are still used in the detail view).
 *
 *  Video / reels: set  type: "video",  video: myClipUrl  (import an .mp4 from
 *  src/assets) and  duration: "0:30".  The card shows a play button.
 *
 *  Category filters with no projects are hidden automatically; with no projects
 *  at all the section shows a “Portfolio coming soon” card instead.
 *  `isSample: true` adds a small “Sample” tag (for practice / mock-up pieces).
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const CATEGORIES = ["All", "Social Media", "Graphics", "Admin Systems"] as const;
export type Category = Exclude<(typeof CATEGORIES)[number], "All">;

export type ProjectImage = { thumb: string; full: string; alt: string };

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  type: "image" | "video";
  /** first image (or images[cover]) is the card; all of them show in the detail view */
  images: ProjectImage[];
  cover?: number;
  description: string;
  tools: string[];
  /** shown in the detail view; defaults to “N designs delivered” */
  results?: string[];
  /** for type: "video" */
  video?: string;
  duration?: string;
  /** practice / mock-up piece — shows a small “Sample” tag */
  isSample?: boolean;
};

/* ── image helpers ────────────────────────────────────────────────────────── */
const originals = import.meta.glob("../assets/portfolio/*/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const thumbs = import.meta.glob("../assets/portfolio-thumbs/*/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

/** All images in src/assets/portfolio/<folder>/, sorted naturally (1, 2, … 10). */
export function fromFolder(folder: string, alt: string): ProjectImage[] {
  return Object.entries(originals)
    .filter(([path]) => path.includes(`/portfolio/${folder}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, full], i) => {
      const file = path.split("/").pop()!.replace(/\.\w+$/, ".webp");
      return { thumb: thumbs[`../assets/portfolio-thumbs/${folder}/${file}`] ?? full, full, alt: `${alt} ${i + 1}` };
    });
}

/* ── the projects ─────────────────────────────────────────────────────────── */
export const PROJECTS: Project[] = [
  {
    id: "bean-and-soul",
    title: "Bean & Soul Café",
    subtitle: "Social Media Graphics · Bean & Soul Café",
    category: "Social Media",
    type: "image",
    images: fromFolder("socialmedia-graphics1", "Bean & Soul Café social media graphic"),
    cover: 4,
    description: "Bold, cozy social media designs that bring your coffee brand to life.",
    tools: ["Canva"],
  },
  {
    id: "bake-n-bloom",
    title: "Bake 'n Bloom",
    subtitle: "Social Media Graphics · Bake 'n Bloom",
    category: "Social Media",
    type: "image",
    images: fromFolder("socialmedia-graphics2", "Bake 'n Bloom social media graphic"),
    cover: 3,
    description: "Whimsical, feminine designs built to make your bakery's treats pop online.",
    tools: ["Canva"],
  },
  {
    id: "scents-and-sense",
    title: "Scents & Sense Labels",
    subtitle: "Perfume Label Design · Scents & Sense",
    category: "Graphics",
    type: "image",
    images: fromFolder("perfume-labels", "Perfume label design"),
    cover: 2,
    description: "Delicate and luxurious label designs crafted for perfume collections.",
    tools: ["Canva"],
  },
  {
    id: "invitations",
    title: "Invitation Suite",
    subtitle: "Invitation Design · Weddings & Celebrations",
    category: "Graphics",
    type: "image",
    images: fromFolder("invitations", "Invitation design"),
    description: "A collection of invitation designs tailored to different themes, ages, and celebration styles.",
    tools: ["Canva"],
  },
  {
    id: "pizza-promos",
    title: "Pizza Night Promos",
    subtitle: "Social Media Graphics · Pizza Shop",
    category: "Social Media",
    type: "image",
    images: fromFolder("socialmedia-graphics3", "Pizza promo social media graphic"),
    description: "Fun, eye-catching social media designs that make your pizza deals irresistible.",
    tools: ["Canva"],
  },
  {
    id: "custom-labels",
    title: "Custom Product Labels",
    subtitle: "Label Design · Candles, Hand Soap & More",
    category: "Graphics",
    type: "image",
    images: fromFolder("customized-labeldesign", "Customized label design"),
    cover: 4,
    description: "Random label designs I've made for alcohol, handsoap and candle products, exploring different styles and layouts.",
    tools: ["Canva"],
  },
  {
    id: "small-business",
    title: "Kid's Busy Books",
    subtitle: "Social Media Graphics · My Small Business",
    category: "Social Media",
    type: "image",
    images: fromFolder("more-graphics", "Small business social media graphic"),
    description: "A mix of social media posts, testimonials, and promos I created for my own small business venture.",
    tools: ["Canva"],
  },
  {
    id: "brand-boards",
    title: "Brand Boards",
    subtitle: "Brand Identity · Bean & Soul Café, Bake 'n Bloom",
    category: "Graphics",
    type: "image",
    images: fromFolder("brandboard-designs", "Brand board design"),
    cover: 1,
    description: "Branding board designs created to explore color palettes, typography, and visual identity for different brands.",
    tools: ["Canva"],
  },
];

export const coverOf = (p: Project) => p.images[p.cover ?? 0] ?? p.images[0];
export const resultsOf = (p: Project) =>
  p.results ?? [`${p.images.length} ${p.images.length === 1 ? "design" : "designs"} delivered`];
