"""QA visual: prints da pagina em desktop/mobile, EN/ES, e checagens basicas.

Uso: python tools/qa_screens.py [URL] [PASTA_SAIDA]
  URL padrao: http://127.0.0.1:8931/
Checa: erros de console, requests falhos, scroll horizontal, imagens sem alt.
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8931/"
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parents[2] / "assets" / "site"
OUT.mkdir(parents=True, exist_ok=True)

RUNS = [
    # (arquivo, largura, altura, idioma do navegador, full_page)
    ("site-desktop-en.png", 1440, 900, "en-US", True),
    ("site-desktop-es.png", 1440, 900, "es-ES", True),
    ("site-mobile-en.png", 390, 844, "en-US", True),
    ("site-mobile-es.png", 390, 844, "es-419", True),
    ("site-360-en.png", 360, 740, "en-US", True),
]


def main() -> int:
    problems = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, w, h, locale, full in RUNS:
            ctx = browser.new_context(viewport={"width": w, "height": h}, locale=locale,
                                      device_scale_factor=1, is_mobile=w < 600, has_touch=w < 600)
            page = ctx.new_page()
            errors, failed = [], []
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.on("requestfailed", lambda r: failed.append(r.url))
            page.on("response", lambda r: failed.append(f"{r.status} {r.url}") if r.status >= 400 else None)
            # retry: conexoes com o GitHub Pages as vezes sofrem reset na rede local
            for attempt in range(4):
                try:
                    page.goto(URL, wait_until="networkidle", timeout=60000)
                    break
                except Exception as exc:  # noqa: BLE001
                    print(f"  goto falhou ({exc.__class__.__name__}), tentativa {attempt + 1}/4")
                    page.wait_for_timeout(3000)
            else:
                problems.append(f"{name}: page did not load")
                ctx.close()
                continue
            failed.clear()  # descarta falhas de tentativas anteriores
            # rola a pagina toda para disparar lazy-load antes do print
            page.evaluate("""async () => {
                for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 180)); }
                window.scrollTo(0, 0);
            }""")
            page.wait_for_timeout(2500)
            info = page.evaluate("""() => ({
                lang: document.documentElement.lang,
                title: document.title,
                scrollW: document.documentElement.scrollWidth,
                clientW: document.documentElement.clientWidth,
                noAlt: [...document.images].filter(i => !i.hasAttribute('alt')).map(i => i.src),
                wide: [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1 && getComputedStyle(e).position !== 'fixed').slice(0, 8).map(e => e.tagName + '.' + e.className),
                demos: document.querySelectorAll('.demo').length,
            })""")
            page.screenshot(path=str(OUT / name), full_page=full)
            print(name, json.dumps(info, ensure_ascii=False))
            if info["scrollW"] > info["clientW"]:
                problems.append(f"{name}: horizontal scroll {info['scrollW']} > {info['clientW']}")
            if errors:
                problems.append(f"{name}: console errors {errors}")
            if failed:
                problems.append(f"{name}: failed requests {failed}")
            if info["noAlt"]:
                problems.append(f"{name}: images without alt {info['noAlt']}")
            ctx.close()
        browser.close()
    print("PROBLEMS:" if problems else "OK: no problems found")
    for pr in problems:
        print(" -", pr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
