"""Screenshot helper (Playwright, system Chrome).

Usage: python scripts/shots.py <url> <prefix> [--full] [--wait ms] [--reduced]
Takes one screenshot per viewport (1440x900, 768x1024, 390x844) into shots-out/<prefix>-<width>.png
and prints console errors and any horizontal overflow.
"""
import argparse
import os
from playwright.sync_api import sync_playwright

VIEWPORTS = [(1440, 900), (768, 1024), (390, 844)]

ap = argparse.ArgumentParser()
ap.add_argument("url")
ap.add_argument("prefix")
ap.add_argument("--full", action="store_true")
ap.add_argument("--wait", type=int, default=600)
ap.add_argument("--reduced", action="store_true")
args = ap.parse_args()

os.makedirs("shots-out", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    for w, h in VIEWPORTS:
        ctx = browser.new_context(
            viewport={"width": w, "height": h},
            reduced_motion="reduce" if args.reduced else "no-preference",
            device_scale_factor=1,
        )
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(args.url)
        page.wait_for_load_state("networkidle")
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(args.wait)
        out = f"shots-out/{args.prefix}-{w}.png"
        page.screenshot(path=out, full_page=args.full)
        overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        fonts = page.evaluate(
            "[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)"
        )
        print(f"{w}px -> {out} | overflow={overflow} | errors={errors} | fonts={sorted(set(fonts))}")
        ctx.close()
    browser.close()
