/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  TOOLS I USE — edit this one array to add, remove or reorder tools.
 *
 *  name       label on the sticker
 *  category   which tab it belongs to
 *  icon       a react-icons component  — or —  monogram: { text, bg } for brands
 *             that have no icon (rendered as a rounded badge in the brand color)
 *  brandColor logo color (softened automatically so it sits nicely on cream)
 *  iconColor  optional override when the brand color is too light (e.g. Google Slides)
 *  usedFor    speech-bubble text on hover / tap (bottom sheet on touch)
 *  level      1–5 dots  ← adjust these to your real comfort level
 *  optional   shows a small “optional” note
 *
 *  Tab order, default tab, favorites and chip sizes live in TOOLS_LAYOUT at the
 *  top of src/sections/tools/Tools.tsx.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { IconType } from "react-icons";
import {
  SiAsana,
  SiClaude,
  SiFacebook,
  SiFigma,
  SiGmail,
  SiGooglecalendar,
  SiGoogledocs,
  SiGoogledrive,
  SiGooglesheets,
  SiGoogleslides,
  SiInstagram,
  SiMeta,
  SiNotion,
  SiPinterest,
  SiTiktok,
} from "react-icons/si";
import { FaLinkedin, FaSlack } from "react-icons/fa";
import { PiMicrosoftExcelLogoFill, PiMicrosoftPowerpointLogoFill, PiMicrosoftWordLogoFill } from "react-icons/pi";
import { RiOpenaiFill } from "react-icons/ri";

/** category tabs, in display order */
export const TOOL_CATEGORIES = ["Design", "Productivity", "Communication", "Social Media", "AI & Planning"] as const;
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

export type Tool = {
  id: string;
  name: string;
  category: ToolCategory;
  icon?: IconType;
  monogram?: { text: string; bg: string };
  brandColor: string;
  iconColor?: string;
  usedFor: string;
  level: 1 | 2 | 3 | 4 | 5;
  optional?: boolean;
};

export const TOOLS_LIST: Tool[] = [
  /* ── Design & Content Creation ── */
  { id: "canva", name: "Canva", category: "Design", monogram: { text: "C", bg: "linear-gradient(135deg, #00C4CC, #7D2AE8)" }, brandColor: "#00C4CC", usedFor: "Graphics, social posts, presentations & brand kits", level: 5 },
  { id: "capcut", name: "CapCut", category: "Design", monogram: { text: "Cc", bg: "#1F1F1F" }, brandColor: "#1F1F1F", usedFor: "Reels, TikToks & short-form video editing", level: 5 },
  { id: "notion", name: "Notion", category: "Productivity", icon: SiNotion, brandColor: "#000000", usedFor: "Content calendars, SOPs & client dashboards", level: 5 },
  { id: "figma", name: "Figma", category: "Design", icon: SiFigma, brandColor: "#F24E1E", usedFor: "Layouts and mockups", level: 3 },

  /* ── Productivity & Documents ── */
  { id: "google-docs", name: "Google Docs", category: "Productivity", icon: SiGoogledocs, brandColor: "#4285F4", usedFor: "Captions, scripts & reports", level: 5 },
  { id: "google-sheets", name: "Google Sheets", category: "Productivity", icon: SiGooglesheets, brandColor: "#34A853", usedFor: "Trackers & content planners", level: 4 },
  { id: "excel", name: "Microsoft Excel", category: "Productivity", icon: PiMicrosoftExcelLogoFill, brandColor: "#217346", usedFor: "Data tracking, reports & formulas", level: 4 },
  { id: "google-slides", name: "Google Slides", category: "Productivity", icon: SiGoogleslides, brandColor: "#F4B400", iconColor: "#C98F00", usedFor: "Presentations & client decks", level: 4 },
  { id: "word", name: "Microsoft Word", category: "Productivity", icon: PiMicrosoftWordLogoFill, brandColor: "#2B579A", usedFor: "Documents & reports", level: 4 },
  { id: "powerpoint", name: "PowerPoint", category: "Productivity", icon: PiMicrosoftPowerpointLogoFill, brandColor: "#D24726", usedFor: "Presentations & slide decks", level: 4 },

  /* ── Storage & Communication ── */
  { id: "google-drive", name: "Google Drive", category: "Communication", icon: SiGoogledrive, brandColor: "#1FA463", usedFor: "File organization & client folders", level: 5 },
  { id: "gmail", name: "Gmail", category: "Communication", icon: SiGmail, brandColor: "#EA4335", usedFor: "Inbox management", level: 5 },
  { id: "google-calendar", name: "Google Calendar", category: "Communication", icon: SiGooglecalendar, brandColor: "#4285F4", usedFor: "Scheduling & appointment setting", level: 5 },
  { id: "slack", name: "Slack", category: "Communication", icon: FaSlack, brandColor: "#4A154B", usedFor: "Team & client chat", level: 3 },

  /* ── Social Media Management ── */
  { id: "meta-business-suite", name: "Meta Business Suite", category: "Social Media", icon: SiMeta, brandColor: "#0081FB", usedFor: "Scheduling & insights for Facebook and Instagram", level: 4 },
  { id: "instagram", name: "Instagram", category: "Social Media", icon: SiInstagram, brandColor: "#E4405F", usedFor: "Posting, stories & community engagement", level: 5 },
  { id: "facebook", name: "Facebook", category: "Social Media", icon: SiFacebook, brandColor: "#0866FF", usedFor: "Page posts & community engagement", level: 5 },
  { id: "tiktok", name: "TikTok", category: "Social Media", icon: SiTiktok, brandColor: "#111111", usedFor: "Short-form video posting", level: 4 },
  { id: "pinterest", name: "Pinterest", category: "Social Media", icon: SiPinterest, brandColor: "#BD081C", usedFor: "Pins & visual inspiration boards", level: 3 },
  { id: "linkedin", name: "LinkedIn", category: "Social Media", icon: FaLinkedin, brandColor: "#0A66C2", usedFor: "Professional posts & networking", level: 3 },

  /* ── AI & Planning ── */
  { id: "asana", name: "Asana", category: "AI & Planning", icon: SiAsana, brandColor: "#F06A6A", usedFor: "Task & project tracking", level: 3 },
  { id: "chatgpt", name: "ChatGPT", category: "AI & Planning", icon: RiOpenaiFill, brandColor: "#10A37F", usedFor: "Brainstorming & first drafts — an assistant, never a replacement", level: 4 },
  { id: "claude", name: "Claude", category: "AI & Planning", icon: SiClaude, brandColor: "#D97757", usedFor: "Drafting captions, brainstorming content ideas, writing and editing copy, and organizing tasks", level: 4 },
];
