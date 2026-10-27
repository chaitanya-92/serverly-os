# Serverly OS — Obsidian Luxe Design System

## Direction
Discord-inspired and familiar, with a more refined warm-neutral finish. Keep the channel tree, server preview, inspector, and familiar text/voice channel affordances. Use restrained bronze as the primary accent; reserve it for primary actions, selected states, focus rings, and meaningful status.

## Brand tokens

| Token | Light | Dark |
|---|---|---|
| Background | `#F5F3EF` | `#12110F` |
| Surface / card | `#FFFDFA` | `#1B1916` |
| Elevated surface | `#EEE9E1` | `#29251F` |
| Primary bronze | `#9B7448` | `#C49A6C` |
| Main text | `#25221F` | `#F2EEE8` |
| Muted text | `#81786D` | `#A49A8D` |
| Border | `#E2DBD0` | `#393229` |
| Destructive | `#C84C45` | `#EF7770` |

## Layout and components
- Use shadcn/ui primitives and CSS-variable tokens for UI controls.
- Use a 12px default radius, 8px compact controls, and subtle borders instead of heavy shadows.
- Keep the three-part desktop composition: template/workspace navigation, Discord-like server preview, and inspector.
- On small screens, stack the panels and preserve accessible controls.
- The preview has its own semantic channel surface tokens, so the server tree stays legible in either theme.
- Typography: system sans-serif, compact labels, clear page heading, and restrained uppercase section labels.
- Focus: visible ring using `--ring`; disabled controls retain legible contrast.
- Theme toggle sits in the app header. Dark mode is the initial experience; the theme state currently lives for the active page session.

## Interaction states
- Selected channel: `--discord-active` background and high-contrast text.
- Hover: `--discord-hover` background.
- Primary action: bronze fill; avoid using the accent as decoration on every element.
- Status colors: green for ready, amber for pending, red for destructive actions.
- Keep text/voice types identifiable by both icon and label, not color alone.

## Scope
The existing server designer remains a local UI prototype. Saving, AI generation, role editing, and Discord deployment are illustrative/not connected to external services yet.
