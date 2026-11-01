"""Regenerates public/og.png (1200x630) from the running title screen.

Usage: npm run build && npm run preview, then in another terminal: python scripts/og.py
Run it again after swapping in the real runner sprite.
"""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", headless=True)
    pg = b.new_page(viewport={"width":1200,"height":630})
    pg.goto("http://localhost:4173/"); pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(900)
    # hide the read mode switch so the card is just the title scene
    pg.add_style_tag(content="#mode-switch{display:none!important}.px-btn .arrow{opacity:0!important}")
    pg.wait_for_timeout(200)
    pg.screenshot(path="public/og.png")
    b.close()
