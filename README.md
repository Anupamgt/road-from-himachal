# The Road from Himachal

A personal portfolio played as an original 16-bit side-scrolling marathon. Scroll to run; each kilometre stone is a chapter. A "Read mode" switch (top right) turns the whole thing into a plain page.

Vite and TypeScript, no UI framework, one page, static files. The only external request is Google Fonts.

## Run it

```bash
npm install
npm run dev
```

```bash
npm run build      # type-checks, then builds to dist/
npm run preview    # serves dist/ on http://localhost:4173
```

## Edit the content

Every fact on the site lives in [src/content.ts](src/content.ts): stages, items, high scores, links, status screen, the finish. Change the words there; no code changes needed.

Anything still missing is marked `TODO:` in that file and listed in `todos` at the bottom. Right now:

- `finish.nextStage`: what you are looking for (shows on the Continue screen as a visible TODO until you fill it in).
- `public/sprites/`: the sprites are placeholders (see below).
- `public/shots/`: the optional product pictures (see below).
- `public/og.png`: regenerate after the real sprite is in.

## Swap in real art

| File | What it is |
| --- | --- |
| `public/sprites/runner_sheet_1x.png` | One row of 10 frames, 64x64 each, facing right. Frames 1-8 run, 9 stands, 10 catches breath. |
| `public/sprites/portrait_32.png` | 32x32 portrait (shown 3x in the dialogue box, 6x on the status screen). |
| `public/shots/minearchive.png` | Optional. Shown in a pixel monitor frame at KM 3. Without it the scene draws a map. |
| `public/shots/sitewatch.png` | Optional. Shown in a pixel phone frame at KM 4. Without it the scene draws a form. |

Drop the files in with the same names and rebuild. `npm run sprites` regenerates the placeholder sprites; do not run it once you have the real ones.

Two small things are drawn on top of the runner in code, because the sheet has no frame for them: the paper cup (from KM 7) and the arms-up pose at the finish. The tapri bench covers his legs so he reads as sitting.

The Open Graph card is a screenshot of the title screen. After changing the sprite, run `npm run build`, `npm run preview`, and in another terminal:

```bash
python scripts/og.py
```

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.

1. Push this repository to GitHub.
2. In the repository, open Settings, then Pages, and set the source to GitHub Actions.
3. Push to `main`. The site appears at `https://<user>.github.io/<repo>/`.

The build uses a relative base path, so it works under any repository name or a custom domain. For the social card, the workflow builds with `SITE_URL` set to the Pages address. If you use a custom domain, add a repository variable named `SITE_URL` with the full address. Without `SITE_URL` the Open Graph image and URL tags are simply left out.

## How it works

- **Scroll model**: the page is one tall scroller with a pinned game window. Each stop has a run segment (the runner moves while you scroll) and a hold segment (he stands at the stone and the chapter opens). Everything is derived from the scroll position, so the runner stops the instant you stop and runs backwards when you scroll up. Jumps from the stage map are instant.
- **Art**: drawn in code on a low-resolution canvas and scaled by whole numbers. Scenes are in `src/scenes`, props and icons in `src/art`. All text is real HTML.
- **Motion**: transform and opacity only. With reduced motion, scenes become stills, text appears at once and banners fade without moving.

## Checks

With the design-taste-frontend skill installed (it lives in `.claude/skills`, which is not committed):

```bash
node .claude/skills/design-taste-frontend/scripts/lint.mjs src index.html
```

Screenshots at three widths: `python scripts/shots.py http://localhost:4173/ name` (needs Python with Playwright and Chrome).
