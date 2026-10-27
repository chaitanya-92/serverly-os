# Serverly OS

**Your community. Your architecture.**

Serverly OS is a visual workspace for planning Discord communities. Build a channel hierarchy, start from a community template, preview the structure, and move blueprint data between sessions without touching Discord settings.

## Current product capabilities

- Animated, responsive product landing page using Framer Motion
- Midnight Violet design system with light and dark themes
- Community starter presets: Developer Hub, Gaming Community, Creator Club, and Study Group
- Discord-style structure preview with text and voice channels
- Add, rename, remove, and change channel types
- Create categories and rename category labels
- Mark channels as private in the local blueprint
- Search channels and inspect the selected channel
- Save and restore a draft in browser local storage
- Import and export a versioned JSON blueprint

## Getting started

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful scripts:

```bash
npm run lint
npm run build
npm start
```

## Blueprint format

Blueprints export as JSON with `schemaVersion: 1`, server metadata, selected template/channel, and a list of categories containing text/voice channels. Keep exported files as backups or use Import JSON to restore a blueprint. Import validates the basic structure before applying it.

## Roadmap

1. **Core editor hardening** — automated tests, accessible category/channel dialogs, validation, and improved error states.
2. **Real persistence and accounts** — database-backed projects, authentication, saved versions, and multi-device sync.
3. **Permission modelling** — roles, channel overrides, and pre-deployment validation.
4. **Discord integration** — official OAuth flow and an authorized integration that applies a user-confirmed blueprint.
5. **AI architect** — generate editable blueprints from a community description.
6. **Template library** — duplicate, publish, and share templates.

## Current limitations

This is an early product foundation. Drafts are stored in the current browser only; JSON export/import is portable, but there is no hosted database or account sync yet. Roles and permissions are illustrative and are not applied to Discord. Deploy server is intentionally a placeholder until official Discord authorization and safe publishing are implemented.
