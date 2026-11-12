#!/usr/bin/env python3
"""Erzeugt karte-detail.js (Höhenlinien und Flüsse) für die Westfront-Karte in index.html.

Gleiche Grundlagen und Signaturen wie die Karte auf der Jünger-Seite (Repo Stahlgewitter):
  - Höhenlinien alle 50 m, kräftig alle 100 m, aus Terrain Tiles (AWS Open Data, Mapzen;
    Quellen u. a. SRTM), Format Terrarium, Zoomstufe 9.
  - Flüsse aus Natural Earth 4.1 (ne_10m_rivers_lake_centerlines und ne_10m_rivers_europe), gemeinfrei.

Projektion: Die Karte nutzt eine Lambert-Projektion. Die Umrechnung Länge/Breite -> Kartenkoordinaten
wird hier aus dem Gradnetz (MAP.graticule in index.html, 1°-Linien) als Polynom 3. Grades angepasst
(Restfehler unter 1 Kartenpixel; Kontrolle gegen Städte und gegen die Flüsse der Jünger-Karte).

Aufruf:  python3 werkzeuge/karte_detail.py <arbeitsordner>
Benötigt: numpy, Pillow, scikit-image. Lädt Kacheln und Flussdaten in den Arbeitsordner.
"""
import io, json, math, os, re, sys, urllib.request
import numpy as np
from PIL import Image
from skimage import measure
from skimage.filters import gaussian

HIER = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HIER)
ARB = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HIER, "_arbeit")
os.makedirs(ARB, exist_ok=True)
Z = 9
X0, X1, Y0, Y1 = -20, 1020, -10, 650          # Kartenausschnitt (Kartenkoordinaten) mit Rand

# ---------- Projektion aus dem Gradnetz ----------
t = open(os.path.join(REPO, "index.html"), encoding="utf-8").read()
MAP = json.loads(next(l for l in t.split("\n") if l.startswith("const MAP = "))[12:].rstrip().rstrip(";"))
mer, par = [], []
for s in filter(None, MAP["graticule"].split("M")):
    pts = [tuple(map(float, p.split(","))) for p in s.split("L")]
    (mer if len(pts) == 2 and abs(pts[0][1] - pts[1][1]) > 500 else par).append(pts)
xat = lambda s, y: s[0][0] + (y - s[0][1]) * (s[1][0] - s[0][0]) / (s[1][1] - s[0][1])
def yat(pl, x):
    for (x1, y1), (x2, y2) in zip(pl, pl[1:]):
        if x1 <= x <= x2: return y1 + (x - x1) * (y2 - y1) / (x2 - x1)
mer.sort(key=lambda s: xat(s, 300)); par.sort(key=lambda s: -s[len(s) // 2][1])
# Meridiane 0° bis 11° O; Breitenkreis durch Paris-Nähe (y≈490 bei x=149) ist 49° N
i49 = min(range(len(par)), key=lambda i: abs((yat(par[i], 149) or 1e9) - 489.9))
P = []
for lo, m in enumerate(mer):
    for i, pl in enumerate(par):
        y = 300.0
        for _ in range(50):
            yy = yat(pl, xat(m, y))
            if yy is None: break
            y = yy
        else: P.append((lo, 49 + i - i49, xat(m, y), y))
P = np.array(P)
def F(lo, la, d=3):
    lo = np.asarray(lo, float) - 5; la = np.asarray(la, float) - 50
    return np.stack([lo ** i * la ** j for i in range(d + 1) for j in range(d + 1 - i)], -1)
A = F(P[:, 0], P[:, 1])
CX = np.linalg.lstsq(A, P[:, 2], rcond=None)[0]; CY = np.linalg.lstsq(A, P[:, 3], rcond=None)[0]
def proj(lo, la): f = F(lo, la); return f @ CX, f @ CY
print("Gradnetz-Anpassung, max. Restfehler:", round(float(np.max(np.hypot(A @ CX - P[:, 2], A @ CY - P[:, 3]))), 2), "px")

def holen(url, ziel):
    if not os.path.exists(ziel):
        with urllib.request.urlopen(url, timeout=60) as r: open(ziel, "wb").write(r.read())
    return ziel

def vereinfachen(p, eps):
    """Douglas-Peucker."""
    if len(p) < 3: return p
    a, b = p[0], p[-1]; d = b - a; n = math.hypot(*d) or 1e-9
    q = p - a
    dist = np.abs(d[0] * q[:, 1] - d[1] * q[:, 0]) / n
    i = int(np.argmax(dist))
    if dist[i] > eps: return np.vstack([vereinfachen(p[:i + 1], eps)[:-1], vereinfachen(p[i:], eps)])
    return np.array([a, b])

def pfad(linien):
    out = []
    for l in linien:
        out.append("M" + "L".join(f"{round(float(x), 1):g},{round(float(y), 1):g}" for x, y in l))
    return "".join(out)

# ---------- Höhenlinien ----------
# Kachelbereich aus den Ecken des Ausschnitts (Umkehr über grobes Gitter)
lo_g, la_g = np.meshgrid(np.linspace(-2, 14, 161), np.linspace(45, 55, 101))
gx, gy = proj(lo_g.ravel(), la_g.ravel())
inn = (gx > X0) & (gx < X1) & (gy > Y0) & (gy < Y1)
lomin, lomax = lo_g.ravel()[inn].min() - .2, lo_g.ravel()[inn].max() + .2
lamin, lamax = la_g.ravel()[inn].min() - .2, la_g.ravel()[inn].max() + .2
n = 2 ** Z
tx = lambda lo: int((lo + 180) / 360 * n)
ty = lambda la: int((1 - math.asinh(math.tan(math.radians(la))) / math.pi) / 2 * n)
TX = range(tx(lomin), tx(lomax) + 1); TY = range(ty(lamax), ty(lamin) + 1)
H = np.zeros((len(TY) * 256, len(TX) * 256), np.float32)
for j, y in enumerate(TY):
    for i, x in enumerate(TX):
        f = holen(f"https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png", os.path.join(ARB, f"t{Z}_{x}_{y}.png"))
        a = np.asarray(Image.open(f).convert("RGB"), np.float32)
        H[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
H = gaussian(H, sigma=1.6, preserve_range=True)
def pix2lonlat(r, c):
    X = TX[0] + c / 256; Y = TY[0] + r / 256
    return X / n * 360 - 180, np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * Y / n))))
minor, major = [], []
for stufe in range(50, int(H.max()) + 50, 50):
    for c in measure.find_contours(H, stufe):
        lo, la = pix2lonlat(c[:, 0], c[:, 1]); x, y = proj(lo, la)
        p = np.stack([x, y], -1)
        m = (x > X0) & (x < X1) & (y > Y0) & (y < Y1)
        if not m.any(): continue
        # an Ausschnittgrenzen zerlegen
        teile, akt = [], []
        for q, ok in zip(p, m):
            if ok: akt.append(q)
            elif akt: teile.append(np.array(akt)); akt = []
        if akt: teile.append(np.array(akt))
        for tl in teile:
            if len(tl) < 4 or np.sum(np.hypot(*np.diff(tl, axis=0).T)) < 6: continue
            (major if stufe % 100 == 0 else minor).append(vereinfachen(tl, .35))

# ---------- Flüsse ----------
riv = []
for name in ["ne_10m_rivers_lake_centerlines", "ne_10m_rivers_europe"]:
    g = json.load(open(holen(f"https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/{name}.geojson", os.path.join(ARB, name + ".geojson")), encoding="utf-8"))
    for ft in g["features"]:
        geo = ft["geometry"]
        if not geo: continue
        for l in (geo["coordinates"] if geo["type"] == "MultiLineString" else [geo["coordinates"]]):
            l = np.array(l); x, y = proj(l[:, 0], l[:, 1])
            if ((x > X0) & (x < X1) & (y > Y0) & (y < Y1)).any(): riv.append(vereinfachen(np.stack([x, y], -1), .3))

# Flussnamen: wie auf der Jünger-Karte, ergänzt um Main und Oberrhein für den Ostteil
LAB = [{"n": "Marne", "p": [254.1, 489.3], "a": -57}, {"n": "Seine", "p": [138.1, 541.2], "a": -66},
       {"n": "Rhein", "p": [648.4, 91.2], "a": -58}, {"n": "Mosel", "p": [587.9, 456.7], "a": 68},
       {"n": "Schelde", "p": [295.5, 145.4], "a": 79}, {"n": "Maas", "p": [420.7, 361.1], "a": 36},
       {"n": "Saar", "p": [635.8, 408.1], "a": 80}, {"n": "Somme", "p": [192, 315.8], "a": -28},
       {"n": "Main", "p": [943.8, 354.1], "a": 31}, {"n": "Rhein", "p": [821.4, 507.3], "a": -61}]
D = {"contours": {"minor": pfad(minor), "major": pfad(major)}, "rivers": pfad(riv), "rivLabels": LAB, "villages": []}
kopf = ("// Detailebenen der Karte (erzeugt mit werkzeuge/karte_detail.py): Höhenlinien aus Terrain Tiles (AWS Open Data,\n"
        "// Mapzen; u. a. SRTM), Flüsse aus Natural Earth 4.1. Gleiche Grundlagen wie die Karte der Jünger-Seite.\n")
open(os.path.join(REPO, "karte-detail.js"), "w", encoding="utf-8").write(kopf + "const DETAIL = " + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("Höhenlinien:", len(minor), "+", len(major), "Flüsse:", len(riv), "Größe:", os.path.getsize(os.path.join(REPO, "karte-detail.js")) // 1024, "KB")
