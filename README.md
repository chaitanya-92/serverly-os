# Serverly OS

**Your community. Your architecture.**

Serverly OS is a visual, AI-ready workspace for designing and deploying Discord server structures. This repository begins with the interactive designer MVP: template presets, editable categories and channels, voice/text channel types, and a Discord-style preview.

## MVP scope

- Select a community preset (Developer, Gaming, Creator, Study)
- Inspect a Discord-style server preview
- Add, rename, remove, and reorder channels/categories
- Switch channel types between text and voice
- Review an editable server blueprint before publishing

## Product roadmap

1. **Designer MVP** — interactive blueprint editor and visual preview
2. **Blueprint validation** — channel/category naming, hierarchy, and permission checks
3. **Discord integration** — OAuth and an authorized bot to apply a confirmed blueprint
4. **AI architect** — turn a natural-language description into a structured blueprint
5. **Saved templates** — persist, duplicate, and share blueprints

## Development

This project is initialized as a Next.js + TypeScript + Tailwind application.

```bash
npm install
npm run dev
```

## Important

The current MVP is a local interactive prototype. It does not connect to Discord or create real servers yet. Discord integration must be implemented using official APIs and explicit server-owner authorization.
