# DESIGN.md — Vel-vt LP Player Design System

Design system specification aligned with [Awesome DESIGN.md](https://github.com/voltagent/awesome-design-md) standards.

---

## 1. Aesthetic Identity & Design Philosophy
- **Style Direction**: Authentic Braun / Dieter Rams functional minimalism fused with modern tactile web physics (Framer Motion).
- **Core Principles**:
  - Pure concentric mechanical alignment (everything turns around the central spindle).
  - Authentic materials: translucent tinted glassmorphic vinyl, matte off-white chassis, perforated circular speaker matrix.
  - Zero digital clutter on the deck: pure form follows function.
- **Stage**: Pure gallery white canvas (`#ffffff`) with subtle, soft ambient drop shadow.

---

## 2. Color Palette & Material Tokens

| Token | Value | Application |
|---|---|---|
| `--stage-bg` | `#ffffff` | Clean gallery stage background |
| `--chassis-bg` | `#f4eee9` | Warm matte off-white turntable body |
| `--chassis-border` | `#e2dad4` | Fine chassis outline and seam dividers |
| `--accent-orange` | `#f05523` / `#ff7244` | Signature Dieter Rams orange (cables, arm, label) |
| `--lp-glass-start` | `rgba(238, 135, 110, 0.58)` | Center translucent peach-coral halo |
| `--lp-glass-mid` | `rgba(228, 120, 94, 0.44)` | Mid-disc radial glass fade |
| `--lp-glass-edge` | `rgba(180, 75, 55, 0.12)` | Subtle outer perimeter falloff |
| `--charcoal-groove` | `#3a3034` to `#241b1f` | Realistic vinyl groove field |
| `--center-label` | `#f05523` | Center record label with "Vel-vt" |
| `--speaker-hole` | `#1e1d20` | Perforated speaker holes on matte chassis |

---

## 3. Typography Hierarchy

- **LCD Dot-Matrix Display**: [Google Font **Doto**](https://fonts.google.com/specimen/Doto) (`font-weight: 700 / 900`). Used for track title, artist name, countdown timer, and GlassButton.
- **Center Label Typography**: **Plus Jakarta Sans** (clean, geometric sans-serif for "Vel-vt").
- **Code & Drawer Data**: **JetBrains Mono** / UI monospace.

---

## 4. Component Anatomy

1. **Continuous Orange Cables**:
   - Dual vertical cords running continuously from below the player all the way to above the chassis.
2. **Concentric Turntable Assembly**:
   - **Platter Axis**: 100% concentrically aligned around `(50%, 50%)`.
   - **Translucent Halo**: `420px × 420px` glassmorphic coral disc with radial gradient and backdrop blur.
   - **Charcoal Groove Disc**: `320px × 320px` with micro-grooves and specular sheen.
   - **Black Inner Ring**: `196px × 196px`.
   - **Center Orange Label**: `106px × 106px` with white "Vel-vt" and spindle pin.
3. **Fixed Pivot & Single Unified Tonearm**:
   - Fixed circular base pivot housing on deck (`top: 44px`, `right: 24px`).
   - Orange arm: single continuous SVG structure with top counterweight, straight shaft, and angled stylus cartridge.
   - Spring physics rotation: resting cradle (`0deg`) to playing position (`22deg`).
4. **Digital LCD Window & Dotted Volume Display**:
   - Google Font Doto typography with real-time song duration countdown.
   - Tapering dot-matrix volume wedge graphic (from Braun reference) rendered below the track title.
5. **Skeuomorphic Slats (Volume Faders)**:
   - 4 white horizontal bars with realistic bevels and inset depression shadows.
   - Discrete stepped volume levels: 100%, 75%, 50%, 25%.
6. **Perforated Speaker Grille**:
   - 20 × 15 grid of circular dark speaker perforations on the white matte chassis panel.
7. **GlassButton**:
   - Elevated pill button with glassmorphism, `@property` conic specular reflections, Doto font, and generous padding (`px-6 py-3.5`).
