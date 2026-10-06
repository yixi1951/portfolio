# SVG Drawing Conventions for Chemistry Diagrams

When drawing chemical structures inline as SVG (in chat responses, step-by-step problem boxes, or worked-example explanations), follow these conventions for clean output. The patterns here are battle-tested — earlier versions of this skill produced misaligned bonds and overlapping text. These rules fix both.

## 1. The rotation trick (the single most important pattern)

Define each bond in a *local* coordinate system where it points along the +x axis, then rotate the wrapping `<g>` to aim it at the substituent. This makes the trigonometry trivial and guarantees that perpendicular elements (wedge bases, dash bars) come out perpendicular to the bond — no manual sin/cos required, no off-center wedges.

### Setup

For a central atom of radius `rc` at the origin and a substituent of radius `rs` at distance `L` along angle `θ` (SVG degrees, +y down):

```svg
<g transform="translate(centerX, centerY)">
  <!-- One <g rotate> per substituent. Inside it, the bond points along +x. -->

  <!-- Plain bond -->
  <g transform="rotate(THETA)">
    <line x1="14" y1="0" x2="49" y2="0" stroke="black" stroke-width="2.5"/>
  </g>

  <!-- Wedge: tip at central atom edge, base at substituent edge -->
  <g transform="rotate(THETA)">
    <polygon points="14,0 49,7 49,-7" fill="black"/>
  </g>

  <!-- Dash: 5 bars perpendicular to bond, growing toward substituent -->
  <g transform="rotate(THETA)">
    <line x1="14"    y1="-1"   x2="14"    y2="1"   stroke="black" stroke-width="2.5"/>
    <line x1="22.75" y1="-2.5" x2="22.75" y2="2.5" stroke="black" stroke-width="2.5"/>
    <line x1="31.5"  y1="-4"   x2="31.5"  y2="4"   stroke="black" stroke-width="2.5"/>
    <line x1="40.25" y1="-5.5" x2="40.25" y2="5.5" stroke="black" stroke-width="2.5"/>
    <line x1="49"    y1="-7"   x2="49"    y2="7"   stroke="black" stroke-width="2.5"/>
  </g>

  <!-- Atoms drawn LAST (so white fill masks any sub-pixel slivers at bond ends) -->
  <circle cx="0" cy="0" r="14" fill="white" stroke="black" stroke-width="1.3"/>
  <text x="0" y="4" text-anchor="middle" font-size="12">C</text>
  <!-- Substituent at (L*cos(θ°), L*sin(θ°)) -->
</g>
```

The key constants — bond from `x=14` (edge of central, radius 14) to `x=49` (= L − rs = 60 − 11) — are why the bond ends touch the atom edges cleanly without overlapping the circles.

## 2. Standard parameters

Use these consistently across diagrams in the same response. Mixing parameters between molecules in the same figure looks unprofessional.

| Parameter | Value | Notes |
|-----------|-------|-------|
| Central atom radius `rc` | 14 | emphasized central atoms |
| Substituent atom radius `rs` | 11 | smaller |
| Bond length `L` | 60 | center-to-center |
| Wedge half-width | 7 | at base end |
| Dash bars | 5 | uniformly spaced from `rc` to `L−rs` |
| Dash bar half-widths | 1, 2.5, 4, 5.5, 7 | linear growth |
| Bond stroke width | 2.5 | |
| Atom circle stroke | 1.3 | |
| Atom label font size | 11 (substituents), 12 (central) | |

## 3. SVG angle conventions

In SVG with y-down, angles in degrees:

| θ | Direction | (cos, sin) |
|---|-----------|------------|
| 0° | right | (1, 0) |
| 90° | down | (0, 1) |
| 180° | left | (−1, 0) |
| 270° | up | (0, −1) |
| 45° | lower-right | (0.707, 0.707) |
| 135° | lower-left | (−0.707, 0.707) |
| 225° | upper-left | (−0.707, −0.707) |
| 315° | upper-right | (0.707, −0.707) |

Substituent screen position at angle θ, distance L: `(L*cos(θ°), L*sin(θ°))`.

## 4. Standard tetrahedral template (for stereocenters)

For a 2D-projected tetrahedral atom showing stereochemistry — two plain bonds in plane, one wedge, one dash:

| Position | θ (SVG) | Position (L=60) | Bond |
|----------|---------|-----------------|------|
| Top-left | 215° | (−49.14, −34.41) | plain |
| Top-right | 325° | (49.14, −34.41) | plain |
| Bottom-left | 145° | (−49.14, 34.41) | wedge (forward) |
| Bottom-right | 35° | (49.14, 34.41) | dash (back) |

For (R) vs (S), swap the wedge and dash identities — same positions, opposite stereochemistry. Don't move atoms around; the visual mirror image of an enantiomer should look like a mirror image.

## 5. VSEPR geometry templates

Reusable angle sets for the five electron geometries:

```
linear:           [0,   180]
trigonal planar:  [270, 30,  150]
tetrahedral:      [215, 325, 145, 35]   # last two are wedge, dash
trig. bipyramidal: [270, 90,  180, 30,  330]   # axials first, then 3 equatorial (left, wedge, dash)
octahedral:       [270, 90,  0,   180, 45,  225]   # 4 in plane + wedge + dash
```

For the in-plane vs wedge/dash distinction, by convention: bonds where one substituent appears "behind" the molecule when projected get the dash; "in front" gets the wedge.

## 6. Lone pair representation

A lone pair is drawn as two small circles (dots) just outside the central atom edge. Use the rotation trick so they end up perpendicular to the radial direction:

```svg
<g transform="rotate(THETA)">
  <circle cx="22" cy="-4" r="2.6" fill="black"/>
  <circle cx="22" cy="4"  r="2.6" fill="black"/>
</g>
```

This places two dots at distance 22 from the central atom (just outside the r=14 circle), spaced 8 units apart perpendicular to the radial direction.

Standard placements:
- **NH₃**: lone pair at θ=270° (straight up)
- **H₂O**: lone pairs at θ=215° and θ=325° (rabbit ears)
- **PCl₃ / SO₂ analogs**: same as NH₃ pattern
- **General**: place lone pairs in the position where a 4th (or 5th, 6th) bond would have gone if it existed

## 7. Avoiding text/diagram overlap

The most common failure mode in chemistry SVGs is text labels colliding with bonds, atoms, or other text. Reserve specific y-zones for specific content.

### Vertical layout zones for one molecule panel

Numbers below assume the central atom is at local origin (y=0):

| y range | Reserved for |
|---------|--------------|
| −110 | Title (bold, centered, font-size 14) |
| −92 | Subtitle (small, gray, font-size 10) — e.g., "1 lone pair · tetrahedral" |
| −75 to −60 | Top atoms / lone pair labels |
| −60 to +60 | The molecule itself (atom circles up to L=60 from center) |
| +60 to +75 | Bottom atoms |
| +85 to +95 | Angle annotation if needed (sometimes also for axial atoms) |
| +105 | Bond angle / key metric (large, bold, colored, font-size 14) |
| +125 | Caption / molecular formula (small, font-size 10) |

That gives ~125 above center + ~140 below center for the panel. For multi-molecule rows in 700px width, panel centers at x ∈ {70, 210, 350, 490, 630} (5 panels) or {140, 350, 560} (3 panels) with these vertical zones leave good breathing room.

### Lone pair text labels

When labeling a lone pair as "lone pair" or "LP" with a text annotation:

- Don't put the text on top of the dots — they'll mash together
- Offset perpendicular to the radial direction, at distance 30+ from the atom
- For LP at θ=270 (straight up), label goes to the side: `<text x="34" y="-25" text-anchor="start" font-size="10">lone pair</text>`

### Atom label positioning inside circles

SVG text baseline is at the bottom of the character. To vertically center inside a circle at (cx, cy):

- For uppercase letter ("C"): `y = cy + 4`
- For two-letter element ("Be", "Cl"): `y = cy + 4` (works because lowercase letters have similar visual mass)
- Always use `text-anchor="middle"` and `x = cx` for horizontal centering

Or use `dominant-baseline="central"`:

```svg
<text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-size="11">C</text>
```

`dominant-baseline="central"` is cleaner but check that your renderer supports it — some older SVG renderers ignore it.

### Angle arc placement

Show a bond angle with a small arc inside the molecule:

```svg
<path d="M 0 -22 A 22 22 0 0 0 -19 11" fill="none" stroke="gray" stroke-width="0.8"/>
<text x="-15" y="-2" text-anchor="middle" font-size="9" fill="gray">120°</text>
```

The arc starts at distance 22 along the first bond direction, sweeps through the angle, and ends at distance 22 along the second bond direction. The angle text goes at the bisector, also at distance 22.

For a 120° angle starting at θ=270 and sweeping CCW to θ=150:
- Start point: (22*cos(270°), 22*sin(270°)) = (0, −22)
- End point: (22*cos(150°), 22*sin(150°)) = (−19.05, 11)
- Arc command: `A 22 22 0 0 0 ...` (the two zeros are: not large-arc, sweep CCW)

## 8. Multi-molecule rows

When showing several molecules side-by-side:

- Distribute panel centers evenly with adequate padding
- Each panel needs ~140 width minimum (more if atoms extend further than L=60 from center)
- Add a horizontal divider line between major sections: `<line x1="50" y1="..." x2="650" y2="..." stroke="lightgray"/>`
- A vertical dashed line between enantiomers helps emphasize the mirror relationship: `<line x1="350" y1="..." x2="350" y2="..." stroke="lightgray" stroke-dasharray="4,4"/>`

## 9. Common pitfalls (and how the rotation trick fixes them)

| Pitfall | Cause | Fix |
|---------|-------|-----|
| Wedge tip hidden under atom circle | Polygon tip at (0,0) — the central atom's center | Use rotation trick: tip at `x=rc` in local frame |
| Wedge appears tilted, not centered on bond axis | Manual perp computation got the rotation wrong | Use rotation trick: base at `(L−rs, ±w)` is automatically perpendicular |
| Dash bars parallel to the bond (look like a hashed line *along* the bond instead of *across* it) | Computed bar endpoints in screen coords without rotating | Use rotation trick: bars are vertical lines in local frame |
| Atom labels above/below the circle | y coordinate not adjusted for text baseline | Use `y = cy + 4` for r=11/r=14 circles, or `dominant-baseline="central"` |
| Bond ends visible as black slivers next to atom circles | Bonds drawn AFTER atoms, no white-fill masking | Always draw bonds first, then atoms, then labels |
| Title overlapping top atoms | Title placed at insufficient y-offset above molecule | Title at y=−110, top atoms can extend to y=−60 (50 units of clearance) |
| Bond angle text inside the molecule overlapping with bonds | Arc/label placed too close to center | Arc radius ≥ 22, label at bisector distance ≥ 22 |
| Two molecules' atoms touching | Panel centers too close together | Min panel pitch 140px; panels centered on x ∈ {70, 210, 350, 490, 630} for 700px width |

## 10. When to skip hand-drawn SVG entirely

Hand-drawn SVG (with these conventions) is right for: VSEPR diagrams, simple stereocenters, mechanism arrows, custom pedagogical illustrations.

It's wrong for: realistic skeletal structures of complex molecules. RDKit's `MolDraw2D` produces vastly better skeletal structures than anyone can hand-draw — proper bond lengths, wedge placement matching the encoded stereochemistry, automatic ring layout. For anything beyond ~6 atoms or ~2 stereocenters, parse SMILES with RDKit and render to SVG.

Decision rule: if the molecule has a name and a SMILES, use RDKit. If you're illustrating a pedagogical concept (geometry, lone pairs, mechanism arrows, generic stereocenter), use hand-drawn SVG with these conventions.
