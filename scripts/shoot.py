#!/usr/bin/env python3
"""Screenshot the Facility Crosswalk site, desktop + mobile, capturing console errors."""
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3117"
OUT = "/home/hatch/workspace/canada-facility-crosswalk/docs/screenshots"

errors = []

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    # Desktop
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on("console", lambda m: errors.append(f"desktop console.{m.type}: {m.text}") if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(f"desktop pageerror: {e}"))
    page.goto(BASE, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(2500)
    page.screenshot(path=f"{OUT}/cfc-desktop-top.png", full_page=False)
    page.evaluate("document.getElementById('showcase')?.scrollIntoView()")
    page.wait_for_timeout(1500)
    page.screenshot(path=f"{OUT}/cfc-desktop-showcase.png")
    page.evaluate("document.getElementById('explorer')?.scrollIntoView()")
    page.wait_for_timeout(1500)
    page.screenshot(path=f"{OUT}/cfc-desktop-explorer.png")
    page.evaluate("document.getElementById('methodology')?.scrollIntoView()")
    page.wait_for_timeout(800)
    page.screenshot(path=f"{OUT}/cfc-desktop-methodology.png")
    page.close()

    # Mobile
    m = browser.new_page(viewport={"width": 390, "height": 844}, is_mobile=True)
    m.on("console", lambda msg: errors.append(f"mobile console.{msg.type}: {msg.text}") if msg.type == "error" else None)
    m.on("pageerror", lambda e: errors.append(f"mobile pageerror: {e}"))
    m.goto(BASE, wait_until="networkidle", timeout=60000)
    m.wait_for_timeout(2500)
    m.screenshot(path=f"{OUT}/cfc-mobile-top.png", full_page=False)
    m.evaluate("document.getElementById('showcase')?.scrollIntoView()")
    m.wait_for_timeout(1500)
    m.screenshot(path=f"{OUT}/cfc-mobile-showcase.png")
    m.close()
    browser.close()

print("ERRORS:" if errors else "ZERO console errors")
for e in errors:
    print(" ", e)
