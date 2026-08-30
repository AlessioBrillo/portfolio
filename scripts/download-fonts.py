#!/usr/bin/env python3
"""
Download variable font TTFs from Google Fonts GitHub and convert to WOFF2.
Uses fonttools + brotli for WOFF2 compression.
"""
import os
import sys
import urllib.request
from fontTools.ttLib import TTFont
from fontTools.ttLib.woff2 import compress

GITHUB_RAW_BASE = "https://github.com/google/fonts/raw/main/ofl"

FONTS = [
    {
        "family": "fraunces",
        "ttf_name": "Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf",
        "woff2_name": "Fraunces.woff2",
    },
    {
        "family": "geist",
        "ttf_name": "Geist%5Bwght%5D.ttf",
        "woff2_name": "Geist.woff2",
    },
    {
        "family": "geistmono",
        "ttf_name": "GeistMono%5Bwght%5D.ttf",
        "woff2_name": "GeistMono.woff2",
    },
]

PUBLIC_FONTS = os.path.join(os.path.dirname(__file__), "..", "public", "fonts")
os.makedirs(PUBLIC_FONTS, exist_ok=True)

def download_font(font):
    url = f"{GITHUB_RAW_BASE}/{font['family']}/{font['ttf_name']}"
    dest_ttf = os.path.join(PUBLIC_FONTS, font['ttf_name'].replace('%5B', '[').replace('%5D', ']').replace('%2C', ','))
    dest_woff2 = os.path.join(PUBLIC_FONTS, font['woff2_name'])
    
    if os.path.exists(dest_woff2):
        print(f"[fonts] {font['woff2_name']} already exists, skipping")
        return
    
    print(f"[fonts] Downloading {font['ttf_name']} from {url}")
    try:
        urllib.request.urlretrieve(url, dest_ttf)
        print(f"[fonts] Downloaded {font['ttf_name']}")
    except Exception as e:
        print(f"[fonts] Failed to download {font['ttf_name']}: {e}")
        sys.exit(1)
    
    print(f"[fonts] Converting {font['ttf_name']} to WOFF2...")
    try:
        compress(dest_ttf, dest_woff2)
        print(f"[fonts] OK {font['woff2_name']} created")
    except Exception as e:
        print(f"[fonts] Failed to convert {font['ttf_name']}: {e}")
        sys.exit(1)
    finally:
        if os.path.exists(dest_ttf):
            os.remove(dest_ttf)

def main():
    print("[fonts] Downloading and converting variable fonts to WOFF2...")
    for font in FONTS:
        download_font(font)
    print("[fonts] Done. Verify in public/fonts/")

if __name__ == "__main__":
    main()