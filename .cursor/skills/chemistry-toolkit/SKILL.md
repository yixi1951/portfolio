---
name: chemistry-toolkit
description: Use this skill whenever the user asks about chemistry, organic chemistry, molecular structures, chemical reactions, equation balancing, skeletal formulas, reaction mechanisms, stoichiometry, or chemical notation. Trigger on phrases like "balance this equation", "draw this molecule", "show me the structure of", "is this balanced", "in 3D", "skeletal diagram", "Lewis structure", "reaction mechanism", "SMILES", or any mention of atoms, ions, bonds, compounds, or organic groups. Even when the user does not say "chemistry" — if the topic involves atoms, bonds, reactions, or geometry, this is the right skill. Covers 2D skeletal structures (RDKit), interactive 3D viewers (3Dmol.js), 2D-to-3D conversion from SMILES, MolView sketcher embedding, KaTeX/mhchem for formulas, equation-balance verification, formula-vs-structure checking, hand-drawn SVG conventions for VSEPR/mechanism diagrams, and step-by-step problem layouts.
---

# Chemistry Toolkit

A skill for representing chemistry — molecules, equations, mechanisms, and step-by-step problem solutions — with the right tool for each job.

## Decision tree: which tool for which job?

Pick the tool by what the user actually needs to do with the output:

| User needs | Use | Why |
|------------|-----|-----|
| Rotate/zoom a molecule in 3D | **3Dmol.js in HTML artifact** | Interactive, free, no API key |
| Convert a SMILES (or 2D structure) into a 3D model | **`scripts/smiles_to_3d.py`** | RDKit ETKDG embedding + force-field minimization |
| Static 2D skeletal structure (image) of a real molecule | **RDKit (Python)** | Industry standard, deterministic |
| Pedagogical 2D illustration (VSEPR, mechanism arrows, generic stereocenter, lone-pair effect) | **Hand-drawn SVG** following `references/svg-drawing-conventions.md` | Custom layouts RDKit can't produce |
| Editable 2D structure the user can modify | **MolView sketcher (embedded)** | Requires user's MolView client ID |
| Chemical equation with subscripts/charges | **KaTeX + mhchem** in markdown or HTML | Renders properly anywhere |
| Verify an equation balances | **`scripts/balance_checker.py`** | Catches arithmetic mistakes |
| Verify a formula matches a skeletal structure | **RDKit** (parse SMILES → formula) | Authoritative comparison |
| Step-by-step problem walkthrough | **HTML artifact with problem-box CSS** (in `assets/`) | Title-on-top, wrapped text below |

If the user wants several of these at once (e.g., "balance the equation, draw both sides, and let me rotate the products in 3D"), produce them as separate visualizations interleaved with prose, not crammed into one artifact.

---

## 1. Chemical equations and formulas (KaTeX + mhchem)

**Always** use the `mhchem` extension for any chemical formula or equation. Never write `H2O` in plain text — write `\ce{H2O}`. mhchem handles subscripts, superscripts, charges, states, and arrows correctly without manual formatting.

### Loading mhchem

In an HTML artifact, after loading KaTeX, also load mhchem:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/mhchem.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}]});"></script>
```

In markdown that the renderer supports (e.g., chat responses with math rendering), wrap mhchem in `$...$` or `$$...$$`.

### mhchem syntax cheatsheet

| What you want | Write | Renders as |
|---------------|-------|------------|
| Water | `\ce{H2O}` | H₂O |
| Sulfate ion | `\ce{SO4^2-}` | SO₄²⁻ |
| Iron(III) | `\ce{Fe^3+}` | Fe³⁺ |
| Isotope | `\ce{^{14}C}` | ¹⁴C |
| State labels | `\ce{NaCl(s) -> Na+(aq) + Cl-(aq)}` | with (s), (aq) |
| Forward reaction | `\ce{A -> B}` | A → B |
| Equilibrium | `\ce{A <=> B}` | A ⇌ B |
| Unbalanced equilibrium right | `\ce{A <=>> B}` | A ⇌ B (right-favored) |
| Unbalanced equilibrium left | `\ce{A <<=> B}` | A ⇌ B (left-favored) |
| Reaction with conditions | `\ce{A ->[\text{cat}][\Delta] B}` | conditions above/below arrow |
| Coefficient + balanced reaction | `\ce{2H2 + O2 -> 2H2O}` | 2H₂ + O₂ → 2H₂O |
| Precipitate / gas | `\ce{AgCl v}` (down) `\ce{H2 ^}` (up) | AgCl↓ , H₂↑ |
| Bond | `\ce{A-B}`, `\ce{A=B}`, `\ce{A#B}` | single, double, triple |

**Critical rule**: never hand-build subscripts with `_2` outside `\ce{}` for chemistry. mhchem handles digit-after-element automatically and gets the spacing right.

---

## 2. Reaction arrows

Use mhchem for arrows in equations (table above). When drawing a **mechanism** or **retrosynthesis** that needs curly arrows or larger arrow art, render an SVG instead:

- **Curly arrows** (electron movement): SVG path with marker arrowhead — single-barb for single-electron (radical), double-barb for electron-pair.
- **Retrosynthesis arrow** (open-tipped, "⇒"): SVG, drawn as two parallel lines meeting at an open V-tip.
- **Resonance double-headed**: `\ce{ <-> }` in mhchem, or SVG with arrowheads on both ends for diagrams.

If the user asks for an arrow type mhchem doesn't cover (e.g., curly mechanism arrows), render the structure + arrow as one SVG.

---

## 3. Balancing equations and verifying balance

When a user asks to balance an equation, **always verify the result with the balance checker** before presenting it. Mistakes are easy and embarrassing.

### Procedure

1. Parse each species into element counts (e.g., `Fe2O3` → `{Fe: 2, O: 3}`).
2. Set up a linear system: for each element, coefficients on the left = coefficients on the right.
3. Solve for smallest positive integer coefficients (use `scripts/balance_checker.py` — it solves the nullspace and reduces to integers).
4. After producing a balanced answer, re-run the checker to confirm.

### Using the checker

```bash
python scripts/balance_checker.py "Fe + O2 -> Fe2O3"
```

Output: balanced equation with coefficients, plus a per-element verification table. If the user's equation is unbalanceable (wrong species, charge mismatch), the script reports which element fails.

The checker also accepts a fully-coefficient'd equation and just verifies it without re-solving:

```bash
python scripts/balance_checker.py --check "4 Fe + 3 O2 -> 2 Fe2O3"
```

**After every balance task, present the verification output to the user.** Do not just claim it balances.

---

## 4. Static 2D skeletal structures (RDKit)

Use RDKit when the user wants a clean skeletal diagram as a PNG/SVG image. RDKit is the standard cheminformatics library; install with `pip install rdkit --break-system-packages` if not present.

```python
from rdkit import Chem
from rdkit.Chem import Draw, AllChem

# Parse SMILES (or InChI, MOL block)
mol = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")  # aspirin

# Generate 2D coordinates
AllChem.Compute2DCoords(mol)

# Draw as SVG (preferred — scales, no aliasing)
drawer = Draw.MolDraw2DSVG(400, 300)
drawer.DrawMolecule(mol)
drawer.FinishDrawing()
svg = drawer.GetDrawingText()
with open("aspirin.svg", "w") as f:
    f.write(svg)
```

For multiple molecules side-by-side (e.g., reactants and products), use `Draw.MolsToGridImage([mol1, mol2, ...], molsPerRow=2)`.

### Verifying formula matches structure

When a user gives both a molecular formula AND a skeletal structure (or SMILES), verify they agree:

```python
from rdkit.Chem import rdMolDescriptors
mol = Chem.MolFromSmiles(smiles)
computed_formula = rdMolDescriptors.CalcMolFormula(mol)
# Compare to the user's claimed formula
```

If they disagree, point out the mismatch element-by-element. Don't silently trust either source.

---

## 5. Interactive 3D viewer (3Dmol.js)

This is the **default** for any "show me in 3D" or "let me rotate this" request. 3Dmol.js is free, loads from CDN, and needs no account.

### Pattern: HTML artifact with 3Dmol viewer

```html
<div id="viewer" style="width: 100%; height: 500px; position: relative;"></div>
<script src="https://3dmol.org/build/3Dmol-min.js"></script>
<script>
  const viewer = $3Dmol.createViewer("viewer", { backgroundColor: "white" });

  // Option A: load by PubChem CID
  $3Dmol.download("cid:2244", viewer, {}, () => {
    viewer.setStyle({}, { stick: {} });
    viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.3 });
    viewer.zoomTo();
    viewer.render();
  });

  // Option B: load from SMILES (requires conversion to 3D coords first — see note)
  // Option C: paste a MOL/PDB/XYZ string directly
  // viewer.addModel(molBlockString, "mol");
</script>
```

### Style options worth knowing

- `{ stick: {} }` — bonds as sticks, default
- `{ sphere: { scale: 0.3 } }` — ball-and-stick when combined with stick
- `{ line: {} }` — fastest, plainest
- `{ cartoon: {} }` — for proteins/biomolecules
- Add `viewer.addLabel("text", { position: {x,y,z}, ... })` for annotations

### When SMILES → 3D is needed

3Dmol.js renders 3D coordinates but doesn't generate them from a 2D SMILES string. Three options:

**Option 1 (recommended): use `scripts/smiles_to_3d.py`.** Takes a SMILES string and produces either a MOL block (paste into a 3Dmol viewer) or a complete self-contained HTML artifact with the molecule rendered, an interactive viewer, style controls (stick/ball-and-stick/space-filling/wireframe), surface toggle, and a properties panel (formula, MW, rotatable bonds, etc.).

```bash
# Self-contained HTML artifact, ready to share
python scripts/smiles_to_3d.py "CC(=O)Oc1ccccc1C(=O)O" --html aspirin.html

# Just the MOL block to paste elsewhere
python scripts/smiles_to_3d.py "CCO"

# Multi-conformer search; lowest-energy conformer is kept
python scripts/smiles_to_3d.py "CC(C)CC(C)(O)CC=O" --conformers 20 --html ionone.html
```

The script uses RDKit's ETKDG (Riniker & Landrum 2015) for geometry embedding and MMFF94 for energy minimization (with UFF fallback for elements MMFF doesn't cover). Both are open-source — see the script header for citations.

Use this whenever the user provides a SMILES, a name + structure, or a hand-drawn 2D molecule and asks to see it in 3D. Don't try to write 3D coordinates by hand — the geometry of even a simple molecule (proper bond lengths, dihedrals, ring puckering) is hard to get right manually.

**Option 2: PubChem CID lookup** (`$3Dmol.download("cid:NNNN", ...)`). Works for known compounds; CIDs from https://pubchem.ncbi.nlm.nih.gov. Faster than running the script if the molecule is in PubChem and you have its CID.

**Option 3: paste a MOL block directly** if you already have one (e.g., from PubChem, downloaded SDF, or RDKit interactive session).

### Mobile note

500px height works on desktop. On mobile, prefer 350–400px and disable surface rendering (it's heavy). Touch gestures (pinch-zoom, two-finger rotate) work natively.

---

## 6. Editable 2D sketcher (MolView)

Use **only** when the user explicitly wants to edit/draw structures themselves (not just view them). For everything else, prefer 3Dmol or RDKit — they don't require accounts.

### Setup flow — explain this to the user

The MolView sketcher API requires a client ID. Walk the user through:

1. Sign up or sign in at https://app.molview.com/sign-in
2. Go to Account settings → Developer tools → request a client ID (a UUID)
3. **Note the limitation**: by default the sketcher only works for users with their own MolView subscription. For wider distribution, they need to contact MolView for a domain license. Make sure the user understands this before they invest time setting it up.

Ask the user for their client ID. Do not put a placeholder UUID in the code — the sketcher won't work and they'll get confusing errors.

### Embed pattern

Once the user has provided a client ID:

```html
<molview-sketcher id="sketcher" style="width:100%; height:600px; display:block;"></molview-sketcher>
<script type="module">
  import { Sketcher } from 'https://app.molview.com/api.js?id=USER_CLIENT_ID_HERE';
  // Sketcher web component is now registered; the <molview-sketcher> tag will hydrate.

  const sketcher = document.getElementById("sketcher");
  // Optional: customize toolbar/style
  await sketcher.set_props({
    style: { typeface: 'serif', atom_color: 'black' }
  });

  // Read what the user has drawn:
  // const smiles = await sketcher.export('smiles');
</script>
```

Replace `USER_CLIENT_ID_HERE` with the value the user provides. Detailed reference is in `references/molview-embed.md`.

---

## 7. Step-by-step problem layout

For multi-step worked problems (stoichiometry, balancing walkthroughs, mechanism stages, synthesis routes), use the problem-box layout in `assets/problem-box.html`. It produces a vertical stack of boxes, each with:

- **Bold title bar** at the top of the box (the step label, e.g. "Step 2: Convert moles to grams")
- **Wrapped body text** below, supporting KaTeX/mhchem inline
- Optional inline figure slot (SVG/image) that flows after the text

### When to use it

- Any answer with 3+ discrete steps
- Stoichiometry calculations (write out: balanced equation → mole ratio → conversion → answer)
- Reaction mechanism stages
- Multi-step synthesis problems

### When NOT to use it

- Single-step answers — just write a paragraph
- Answers that are mostly one diagram with a caption

The template is self-contained (no build step). Copy `assets/problem-box.html`, fill in the steps array, and emit as an HTML artifact.

---

## 8. Hand-drawn SVG diagrams (VSEPR, mechanisms, custom illustrations)

For pedagogical illustrations that RDKit can't produce — VSEPR geometries with explicit lone pairs, generic stereocenters with abstract substituents, mechanism arrows, projection comparisons (Newman, Fischer, Haworth) — write SVG directly.

**The full conventions are in `references/svg-drawing-conventions.md` — read it before drawing.** It covers atom/bond sizing, the rotation trick that keeps trigonometry correct, the standard tetrahedral and VSEPR templates, lone-pair representation, and (importantly) text layout zones to avoid label/diagram overlap. Don't try to compute bond endpoints with hand-rolled trigonometry; the rotation trick handles it for free.

### The rotation trick — non-negotiable

Every bond goes inside a `<g transform="rotate(THETA)">` and is described in local +x coordinates. This guarantees that wedge bases are perpendicular to the bond, dash bars cross the bond instead of running along it, and the bond endpoints touch the atom edges cleanly.

```svg
<g transform="rotate(35)">  <!-- Bond pointing toward lower-right -->
  <!-- Plain bond: -->
  <line x1="14" y1="0" x2="49" y2="0" stroke="black" stroke-width="2.5"/>
  <!-- OR wedge: -->
  <polygon points="14,0 49,7 49,-7" fill="black"/>
  <!-- OR dash (5 perpendicular bars, growing): -->
  <line x1="14" y1="-1" x2="14" y2="1" stroke="black" stroke-width="2.5"/>
  <line x1="22.75" y1="-2.5" x2="22.75" y2="2.5" stroke="black" stroke-width="2.5"/>
  <line x1="31.5" y1="-4" x2="31.5" y2="4" stroke="black" stroke-width="2.5"/>
  <line x1="40.25" y1="-5.5" x2="40.25" y2="5.5" stroke="black" stroke-width="2.5"/>
  <line x1="49" y1="-7" x2="49" y2="7" stroke="black" stroke-width="2.5"/>
</g>
```

Constants (`14`, `49`, `7`, etc.) come from the standard parameter table in the conventions reference: central atom radius 14, bond length 60, substituent radius 11, so the bond visible from x=14 to x=L−rs=49.

### Text layout zones

Avoid label/diagram overlap by reserving y-ranges within each molecule panel (relative to the molecule's center at y=0):

| y range | Reserved for |
|---------|--------------|
| −110 | Title (font-size 14, bold) |
| −92 | Subtitle (font-size 10, gray) |
| −60 to +60 | The molecule itself |
| +105 | Bond angle / key metric (font-size 14, bold, colored) |
| +125 | Caption / formula (font-size 10) |

For multi-molecule rows in a 700-wide SVG, use panel centers at x ∈ {70, 210, 350, 490, 630} (5 panels) or {140, 350, 560} (3 panels). See the conventions reference for full details.

### When to use this vs. RDKit

- **Hand-drawn SVG**: VSEPR, lone pairs, mechanism arrows, generic stereocenter for teaching, anything where the molecule is abstract or schematic
- **RDKit**: any real, named molecule with a SMILES — RDKit produces vastly better skeletal structures than hand-drawing, with proper bond angles and automatic ring layout

Decision rule: if the molecule has a name and a SMILES, use RDKit. If you're illustrating a concept, use hand-drawn SVG.

---

## 9. Working principles

**Always verify, never claim.** When you balance an equation, run the checker. When a user gives a formula and a structure, parse both with RDKit and compare. Chemistry has objectively right answers — use them.

**Prefer free tools.** 3Dmol.js and RDKit handle most needs without accounts. Only reach for MolView when the user specifically needs to edit structures interactively.

**Subscripts and charges go in `\ce{}`.** Plain text `H2O` and `Fe3+` are wrong-looking. Always use mhchem.

**Show the molecule the way the user is thinking about it.** If they're learning organic chemistry mechanisms, they want skeletal structures, not ball-and-stick 3D. If they're studying VSEPR, the opposite. Match the representation to the pedagogical context.

**Don't fabricate SMILES.** If the user names a compound and you're not certain of the structure, look it up (PubChem, Wikipedia) or ask. A wrong SMILES propagates into wrong renderings, wrong formulas, wrong everything.

---

## Reference files

- `references/svg-drawing-conventions.md` — Hand-drawn SVG patterns: rotation trick, text layout zones, VSEPR templates, lone-pair representation. **Read this before drawing any SVG diagram.**
- `references/molview-embed.md` — Detailed MolView embed reference (toolbar customization, save/load, export formats)
- `references/3dmol-recipes.md` — Common 3Dmol.js patterns (orbitals, surfaces, multi-model, animations)
- `references/mhchem-full.md` — Complete mhchem syntax reference
- `scripts/balance_checker.py` — Equation balancer + verifier
- `scripts/smiles_to_3d.py` — Convert a SMILES (or 2D structure) into a 3D MOL block or self-contained interactive HTML viewer. Built on RDKit (BSD-3) and 3Dmol.js (BSD-3); citations in script header.
- `assets/problem-box.html` — Step-by-step problem layout template
- `assets/3dmol-template.html` — Minimal 3Dmol viewer artifact starter

## Open-source attribution

This skill builds on permissively-licensed open-source projects:

- **RDKit** (BSD-3-Clause) — https://github.com/rdkit/rdkit — SMILES parsing, 2D/3D coordinate generation, force-field optimization, descriptors, structure rendering
- **3Dmol.js** (BSD-3-Clause) — https://github.com/3dmol/3Dmol.js — interactive 3D molecule viewer
- **mhchem** (LPPL / MIT) — https://mhchem.github.io/MathJax-mhchem/ — chemical equation typesetting
- **KaTeX** (MIT) — https://katex.org — math/equation rendering
- **Open Babel** (GPL-2.0, optional alternative to RDKit) — https://openbabel.org

Algorithm references for 3D coordinate generation:
- Riniker, S. & Landrum, G. A. *J. Chem. Inf. Model.* **2015**, *55*, 2562–2574 (ETKDG distance geometry method)
- Halgren, T. A. *J. Comput. Chem.* **1996**, *17*, 490–519 (MMFF94 force field)
- Rappé, A. K. et al. *J. Am. Chem. Soc.* **1992**, *114*, 10024–10035 (UFF force field)
