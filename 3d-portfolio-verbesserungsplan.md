# Verbesserungsplan für die eigene 3D-Portfolio-Homepage

**Ziel:** Die bestehende Phantomland-inspirierte Portfolio-Homepage von einer bereits auffälligen, interaktiven 3D-Website zu einer technisch sauberen, visuell hochwertigen und professionell wirkenden Creative-Developer-Seite weiterentwickeln.

Dieses Dokument kombiniert zwei Ebenen:

1. **Konkrete Probleme der aktuellen Seite**
2. **Technische Qualitätshebel für hochwertigeres, glaubwürdigeres 3D**

Die Priorität liegt ausdrücklich nicht darauf, einfach mehr Effekte hinzuzufügen.  
Das Ziel ist **mehr Kontrolle, bessere Lichtführung, bessere Materialwirkung, sauberere Perspektive und weniger Demo-/Game-Look**.

---

# 1. Aktuelle Kernprobleme

## 1.1 Falsche räumliche Krümmung / Fisheye-Wirkung

### Problem

Die zentrale Galerie wirkt teilweise so, als würde sie sich nach außen wölben.

Gewünscht ist jedoch eher eine **leichte konkave Raumwirkung**:

- Mitte optisch etwas zurückgesetzt
- äußere Projektkarten leicht zum Betrachter gedreht
- kein kugelförmiger Fisheye-Look
- keine sichtbare Verzerrung von Bildern und Typografie

### Verbesserung

- FOV reduzieren
- Kamera weiter zurücksetzen
- Rotation und Z-Position der äußeren Karten neu abstimmen
- Perspective/Transform nicht übertreiben
- wenn möglich echte räumliche Positionierung statt starker CSS-Verzerrung
- Texte selbst nicht perspektivisch verformen

### Priorität

**P0 – höchste Priorität**

---

# 2. Kamera und Perspektive

## Problem

Ein zu großes Field of View erzeugt:

- billige Weitwinkelwirkung
- Fisheye-Eindruck
- übertriebene Größenunterschiede
- stark verzerrte Randbereiche

## Verbesserung

Für hochwertige Produkt-/Portfolio-Inszenierung:

```text
ca. 30°–50° FOV testen
```

Dafür Kamera weiter zurücksetzen.

### Ziel

Eher:

> professionelle Produktfotografie

statt:

> Action-Cam / Videospielkamera

### Regel

Kleine FOV + größere Kameradistanz ist meistens hochwertiger als große FOV + nahe Kamera.

---

# 3. Hintergrund und Lichtführung

## Problem

Wenn der Hintergrund zu grau oder gleichmäßig beleuchtet ist, verliert die Galerie Tiefe.

Phantomland wirkt hochwertig, weil der Raum selbst fast verschwindet.

## Verbesserung

- Hintergrund deutlich schwärzer
- keine großflächig hellen Flächen
- aktive Karte erzeugt den visuellen Fokus
- Nachbarkarten dunkler
- Lichtschein nur dort, wo er dramaturgisch Sinn ergibt
- keine Neon-Überstrahlung

### Ziel

Der Besucher soll nicht zuerst den Hintergrund sehen, sondern das aktive Projekt.

---

# 4. Aktive Projektkarte stärker inszenieren

## Problem

Wenn alle Projektkarten ähnlich hell und ähnlich groß sind, fehlt Hierarchie.

## Verbesserung

Aktives Projekt:

- etwas größer
- klarer
- heller
- stärkerer Kontrast
- mehr Material-/Lichtwirkung
- sichtbare Metadaten
- klare CTA

Nachbarprojekte:

- leicht kleiner
- etwas dunkler
- weniger Bewegung
- reduzierte Detailwirkung

### Ziel

Die aktive Karte soll wie ein Objekt auf einer Bühne wirken.

---

# 5. Scroll-Flackern und Rendering-Probleme

## Problem

Flackern, Clipping oder sichtbare Randartefakte zerstören sofort den Premium-Eindruck.

## Verbesserung

- möglichst nur `transform` und `opacity` animieren
- Layout-Reflows vermeiden
- keine permanenten Größenänderungen über Layout-Eigenschaften
- Clipping sauber lösen
- GPU-Komposition prüfen
- keine wechselnden `overflow`-Zustände während des Scrollens
- keine unnötigen DOM-Rebuilds
- schnelle Scrollbewegungen testen
- 60-Hz- und 120-Hz-Geräte prüfen

### Priorität

**P0**

---

# 6. Scroll-Dramaturgie

## Problem

Ein einfacher horizontaler Card-Wechsel wirkt schnell wie ein normaler Slider.

## Verbesserung

Jedes Projekt erhält eine klare Bewegungsdramaturgie:

```text
Annäherung
→ Ausrichtung
→ Fokus
→ Informationsphase
→ Ablösung
→ nächstes Projekt
```

### Beispiel

1. Projekt kommt seitlich in die Szene.
2. Kamera/Karte stabilisiert sich.
3. Karte wird aktiv.
4. Licht und Kontrast steigen.
5. Titel/Meta erscheinen.
6. beim Weiterscrollen löst sich der Zustand wieder.

### Wichtig

Nicht alle Eigenschaften gleichzeitig animieren.

---

# 7. Bottom Navigation

## Empfehlung

Navigation weiterhin:

- unten mittig
- kompakt
- wie ein Interface-Element
- nicht wie klassische Navbar

### Beispiel

```text
01     02      03      04
WORK   GAMES   LAB     ABOUT
```

### Verbesserung

- aktiver Zustand klar
- sehr wenig visuelles Gewicht
- keine riesigen Pills
- keine starke Glassmorphism-Optik

---

# 8. Top-Center Branding

## Empfehlung

Oben mittig keine zweite Navigation.

Stattdessen:

- Logo
- kurzer Claim
- Status-/Markenzeile

Beispiel:

```text
EMFAU — DESIGN · CODE · INTERACTION
```

oder reduzierter.

### Ziel

Die Seite erhält eine filmische Rahmung:

```text
oben: Marke
mitte: Projekte
unten: Navigation
```

---

# 9. EMFAU-Logo

## Problem

Die bisherige Rockstar-artige Richtung war interessant, darf aber nicht wie eine Kopie wirken.

## Ziel

Ein eigenständiges, kompaktes Logo:

```text
[Symbol] emfau
```

Zusätzlich:

```text
[Symbol]
```

und:

```text
emfau
```

### Anforderungen

- lesbar
- stark in klein
- schwarz/weiß funktionierend
- für Website und Games nutzbar
- nicht überillustrativ

---

# 10. Projekt-Hierarchie

## Problem

Wenn alle Projekte gleich behandelt werden, ziehen schwächere Arbeiten die stärkeren herunter.

## Verbesserung

Drei Ebenen:

### Featured

Nur die stärksten Arbeiten.

### Selected Work

gute, relevante Projekte.

### Archive / Experiments

ältere oder experimentelle Arbeiten.

### Ziel

Qualität vor Vollständigkeit.

---

# 11. Projektkarten inhaltlich aufwerten

Aktive Karte sollte nicht nur Screenshot + Titel zeigen.

## Sinnvoll

```text
PROJECT NAME

Category / Role
Year

kurze prägnante Beschreibung

[OPEN PROJECT]
```

Optional:

- Tech
- Live Demo
- Repository
- Plattform
- Status

### Wichtig

Diese Informationen erst im Fokuszustand zeigen.

---

# 12. Echte 3D-Tiefe statt ausschließlich CSS

## Problem

Wenn die gesamte räumliche Wirkung nur aus:

- Scale
- Perspective
- Blur
- CSS-Rotation

besteht, stößt die Illusion irgendwann an Grenzen.

## Verbesserung

Echtes Three.js/WebGL nur selektiv einsetzen.

Mögliche Anwendungen:

- räumliche Lichtflächen
- subtile Shader-Geometrie
- 3D-Logo
- Partikel/Staub
- echtes Hero-Objekt eines ausgewählten Projekts

### Nicht

Die ganze Seite als Fullscreen-Canvas neu bauen.

---

# 13. Technischer 3D-Qualitätshebel: Geometrie

## Problem

Selbst gute Texturen können schwache Geometrie nicht retten.

Besonders sichtbar:

- mathematisch perfekt scharfe Kanten
- schlechte Normalen
- unnatürlich niedrige Segmentzahl
- falsche Größenverhältnisse

## Verbesserung

### Bevels

Kleine reale Bevels an sichtbaren Kanten.

Warum:

Licht braucht eine Fläche, auf der Highlights entstehen können.

### Normalen

- konsistent
- keine harten Artefakte
- Weighted Normals bei geeigneten Modellen prüfen

### Silhouette

Polygonreduktion nur dort, wo die Silhouette nicht leidet.

---

# 14. PBR-Materialien

## Ziel

Materialien sollen physikalisch plausibel reagieren.

Je nach Material verwenden:

- Base Color
- Roughness
- Metalness
- Normal
- optional AO
- Displacement nur gezielt

### Besonders wichtig

**Roughness ist einer der größten visuellen Hebel.**

Metall, Kunststoff, lackiertes Holz und Glas dürfen nicht alle gleich spiegeln.

---

# 15. HDRI / Environment Lighting

## Problem

Ohne Environment Map wirken selbst gute Materialien schnell steril.

## Verbesserung

Hochwertiges HDRI nutzen für:

- Reflexionen
- globale Lichtstimmung
- realistischere Metallflächen
- realistischere lackierte Oberflächen

### Empfehlung

- 1K oder 2K
- keine riesigen 8K-HDRIs ohne nachgewiesenen Vorteil
- Environment kann unsichtbar bleiben

---

# 16. Lightformer / Studiolicht

HDRI allein reicht nicht immer.

## Ergänzend

2–4 große weiche Lichtflächen:

- Key Light
- Fill
- Rim Light
- optional Front Fill

### Ziel

Kontrollierte Highlight-Kanten.

Besonders wichtig für:

- schwarzes Material
- Metall
- Glas
- dunkle Projektkarten

---

# 17. Tone Mapping

## Empfehlung

**AgX Tone Mapping testen.**

### Warum

Es behandelt sehr helle Bereiche und Kontraste deutlich hochwertiger als einfache lineare Ausgabe.

### Ziel

- Highlights nicht ausbrennen lassen
- bessere Farbübergänge
- weniger billiger CGI-Look

---

# 18. Exposure

## Problem

Einfach alles heller zu machen zerstört Materialien.

## Verbesserung

Exposure zusammen mit:

- HDRI
- Key Light
- Material-Roughness
- Tone Mapping

abstimmen.

### Ziel

Keine ausgebrannten weißen Flächen und keine komplett toten schwarzen Materialien.

---

# 19. Reflexionsdesign

## Wichtig

Bei Metall und Glas sind Reflexionen oft wichtiger als Schatten.

### Verbesserung

Gezielte helle Flächen im Environment bzw. Lightformer verwenden.

Beispiel:

Ein schwarzes Metallobjekt wird erst sichtbar durch:

- helle Kantenreflexe
- kontrollierte Lichtstreifen
- dunkle Zwischenflächen

---

# 20. Contact Shadows

## Problem

Objekte wirken schnell so, als würden sie schweben.

## Verbesserung

Subtile:

- Contact Shadows
- AO
- Bodenabdunklung

### Wichtig

Nicht als harte schwarze Flecken.

---

# 21. Mikro-Unregelmäßigkeiten

## Problem

Perfekt homogene Materialien wirken synthetisch.

## Verbesserung

Sehr subtile:

- Roughness-Variation
- feine Normal-Struktur
- leichte Materialunterschiede

### Nicht

Alles mit Kratzern und Dreck überziehen.

---

# 22. Farbmanagement

## Pflicht

Farbräume korrekt behandeln.

### Typisch

Base Color:

```text
sRGB
```

Roughness / Metalness / Normal:

```text
linear / non-color
```

Fehler hier führen zu:

- falschen Farben
- flauen Materialien
- falscher Roughness
- schlechtem Kontrast

---

# 23. Anti-Aliasing

## Problem

Gezackte Kanten zerstören Premium-3D.

## Verbesserung

Je nach Stack prüfen:

- MSAA
- SMAA
- FXAA nur wenn nötig
- höhere DPR nur begrenzt

### Ziel

Saubere Kanten ohne massive Performance-Kosten.

---

# 24. Bloom

## Regel

Extrem sparsam.

### Sinnvoll

Nur:

- echte Lichtquellen
- definierte Emission
- sehr geringe Intensität

### Nicht

Jede helle Fläche glühen lassen.

Das erzeugt sofort einen Gaming-/Cyberpunk-Look.

---

# 25. Depth of Field

## Empfehlung

Nur für definierte Fokusmomente.

### Sinnvoll

- Projekt-Intro
- statischer Hero
- kurze Fokusphase

### Nicht

Während normaler Navigation dauerhaft.

Zu viel DOF:

- erschwert Lesen
- wirkt künstlich
- kostet Performance

---

# 26. Motion / Trägheit

## Problem

Lineare Bewegung wirkt technisch und billig.

## Verbesserung

- Ease In/Out
- leichte Spring-Dynamik
- kontrollierte Trägheit
- keine abrupten Richtungswechsel

### Wichtig

Nur wenige Elemente gleichzeitig bewegen.

---

# 27. Bewegungs-Hierarchie

## Regel

Wenn Kamera bewegt wird:

- Projekt möglichst stabil halten.

Wenn Projekt rotiert:

- Hintergrund ruhiger.

Wenn UI eingeblendet wird:

- Kamera nicht gleichzeitig stark bewegen.

### Ziel

Weniger Bewegung, aber bessere Bewegung.

---

# 28. Texturauflösung

## Empfehlung

Normalerweise:

- Nebenobjekte: 1K
- Hero-Objekte: 2K
- 4K nur nach sichtbarem Nachweis

### Nicht

8K laden, nur weil es verfügbar ist.

Fotorealismus entsteht stärker durch:

- Licht
- Material
- Geometrie
- Reflexion
- Komposition

als durch maximale Texturauflösung.

---

# 29. GLB-/GLTF-Optimierung

## Empfehlung

- GLB
- Meshopt
- WebP
- optional KTX2 später
- Texturen reduzieren
- Nodes sauber benennen

### Ziel

Hohe visuelle Qualität bei kleiner Dateigröße.

---

# 30. LOD

## Sinnvoll bei

- entfernten Projektkarten
- mehreren 3D-Objekten
- großen Szenen
- Mobile

### Prinzip

Nahe Objekte:

```text
LOD0
```

weiter entfernt:

```text
LOD1 / LOD2
```

### Wichtig

Silhouette erhalten.

---

# 31. Komposition wie Produktfotografie

## Einer der wichtigsten Hebel überhaupt

3D-Szene nicht wie ein Game-Level behandeln.

### Stattdessen

- klares Hero-Objekt
- bewusste Negativfläche
- Lichtkante
- kontrollierte Perspektive
- gezielte Reflexion
- reduzierte Anzahl sichtbarer Elemente

### Ziel

Virtuelle Produktfotografie.

---

# 32. Mobile als eigene Komposition

## Problem

Desktop-3D einfach kleiner zu skalieren funktioniert selten.

## Mobile-Version

- weniger sichtbare Karten
- kleineres FOV-Experiment vermeiden
- weniger Blur
- weniger Postprocessing
- einfachere Lichtsetzung
- Swipe statt komplexem Scrollraum
- reduzierte 3D-Objekte
- kleinere DPR

### Prinzip

Desktop:

> räumliche Galerie

Mobile:

> fokussierter Premium-Viewer

---

# 33. Performance

## Pflicht

Eine visuell starke Seite darf sich nicht langsam anfühlen.

### Maßnahmen

- 3D lazy laden
- Bilder AVIF/WebP
- Videos erst im Fokus
- `frameloop="demand"` wo sinnvoll
- Canvas pausieren, wenn nicht sichtbar
- DPR limitieren
- mobile Qualität reduzieren
- HDRI klein halten
- Texturen komprimieren
- `prefers-reduced-motion`
- keine unnötigen Echtzeitschatten

---

# 34. Was ausdrücklich vermieden werden soll

Nicht:

- extreme Fisheye-Kamera
- Neon überall
- permanenter Bloom
- 8K-Texturen ohne Nutzen
- übertriebene Partikel
- Vollbild-WebGL ohne DOM
- Game-Steuerung
- WASD
- starke Kameraschwenks
- zu viele simultane Animationen
- unkontrollierte Reflektionen
- harte schwarze Schatten
- starkes DOF
- komplette Website in 3D
- maximale Effektdichte

---

# 35. Konkrete Prioritäten

## P0 – zuerst lösen

1. Kamera/FOV
2. falsche konkave/konvexe Perspektive
3. Scroll-Flackern
4. schwarzer Raum / Lichtführung
5. aktive Projektkarte klar hervorheben

## P1 – danach

6. HDRI
7. PBR-Materialien
8. Roughness-Abstimmung
9. Lightformer / Studiolicht
10. AgX Tone Mapping
11. Exposure
12. Contact Shadows
13. Bevels / Normalen

## P2

14. Motion-Timing
15. Projekt-Hierarchie
16. Bottom Navigation
17. Top Branding
18. Logo
19. ausgewähltes echtes WebGL
20. Microinteractions

## P3

21. Anti-Aliasing-Feinschliff
22. Mikro-Roughness
23. sehr dezentes Bloom
24. selektives DOF
25. LOD
26. KTX2 / zusätzliche Asset-Optimierung

---

# 36. Die fünf stärksten technischen Hebel

Wenn nur fünf Dinge umgesetzt werden können:

## 1. Kamera/FOV

30–50° testen, Kamera zurücksetzen.

## 2. HDRI

Realistische Umgebungsreflexion.

## 3. PBR / Roughness

Materialien korrekt differenzieren.

## 4. Lightformer / Studiolicht

Kontrollierte Highlights.

## 5. AgX + Exposure

Bessere Kontrast- und Highlight-Wiedergabe.

Diese fünf Punkte sollten einen sichtbar größeren Qualitätssprung bringen als zusätzliche Partikel, Shader oder komplexere Animationen.

---

# 37. Zielbild

Die Homepage soll am Ende nicht wirken wie:

> eine Website mit vielen 3D-Effekten

sondern wie:

> eine hochwertige digitale Bühne für Projekte.

Der gewünschte Eindruck ist:

- dunkel
- ruhig
- präzise
- räumlich
- kontrolliert
- hochwertig
- technisch sauber

Nicht:

- verspielt
- cyberpunkig
- überladen
- gameartig
- effekthascherisch

---

# 38. Definition of Done

Der Umbau ist erst dann erfolgreich, wenn:

- die Galerie nicht mehr falsch fisheye-artig wirkt,
- die Mitte optisch korrekt zurückgesetzt ist,
- aktive Projekte klar fokussiert werden,
- Scrollen ohne Flackern funktioniert,
- Schwarzwerte und Lichtführung hochwertig wirken,
- 3D-Materialien glaubwürdig reagieren,
- Reflexionen bewusst gestaltet sind,
- Kamera und Bewegung ruhig wirken,
- Mobile eine eigene saubere Komposition besitzt,
- die Seite auch auf schwächeren Geräten flüssig bleibt,
- 3D den Inhalt unterstützt statt davon abzulenken.

---

# 39. Arbeitsreihenfolge für den Coding Agent

## Phase 1

Nur Kamera, Perspektive und Scrollfehler.

Noch keine neuen visuellen Effekte.

## Phase 2

Licht-/Materialpipeline:

- HDRI
- PBR
- Roughness
- Lightformer
- AgX
- Exposure

## Phase 3

Aktive Projektkarte und Scroll-Dramaturgie.

## Phase 4

Branding / Navigation / Hierarchie.

## Phase 5

Selektiv echtes Three.js-/WebGL-Element hinzufügen.

## Phase 6

Performance und Mobile-Finish.

---

# 40. Kernregel

> Erst räumliche Kontrolle, Licht und Materialqualität perfektionieren.  
> Danach zusätzliche Effekte hinzufügen.

Das ist der wichtigste Unterschied zwischen einer auffälligen WebGL-Demo und einer professionellen 3D-Portfolio-Homepage.
