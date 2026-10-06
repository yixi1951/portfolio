# mhchem Syntax Reference

`mhchem` is a LaTeX/KaTeX extension that handles chemistry typesetting. Inside `\ce{...}`, write chemistry naturally and it formats correctly.

## Loading mhchem with KaTeX

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/mhchem.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false}
    ]
  });"></script>
```

The `mhchem.js` script must load **before** auto-render runs.

## Formulas

| Input | Renders |
|-------|---------|
| `\ce{H2O}` | H₂O |
| `\ce{H2SO4}` | H₂SO₄ |
| `\ce{Al(OH)3}` | Al(OH)₃ |
| `\ce{Al2(SO4)3}` | Al₂(SO₄)₃ |
| `\ce{CuSO4 . 5 H2O}` | CuSO₄·5H₂O |

mhchem auto-detects digit-after-element as subscript.

## Charges

| Input | Renders |
|-------|---------|
| `\ce{H+}` | H⁺ |
| `\ce{OH-}` | OH⁻ |
| `\ce{Fe^2+}` | Fe²⁺ |
| `\ce{Fe^3+}` | Fe³⁺ |
| `\ce{SO4^2-}` | SO₄²⁻ |
| `\ce{PO4^3-}` | PO₄³⁻ |

For charges with explicit position, use `^{}`:
- `\ce{NH4^+}` for NH₄⁺
- `\ce{[Fe(CN)6]^3-}` for [Fe(CN)₆]³⁻

## Isotopes

| Input | Renders |
|-------|---------|
| `\ce{^{14}C}` | ¹⁴C |
| `\ce{^14_6C}` | ¹⁴₆C (mass + atomic number) |
| `\ce{^{235}_{92}U}` | ²³⁵₉₂U |

## State labels

State labels go in parentheses without escaping:

| Input | Renders |
|-------|---------|
| `\ce{H2O(l)}` | H₂O(l) |
| `\ce{NaCl(s)}` | NaCl(s) |
| `\ce{CO2(g)}` | CO₂(g) |
| `\ce{Na+(aq)}` | Na⁺(aq) |

## Reaction arrows

| Input | Arrow |
|-------|-------|
| `\ce{A -> B}` | → forward |
| `\ce{A <- B}` | ← reverse |
| `\ce{A <=> B}` | ⇌ equilibrium |
| `\ce{A <=>> B}` | right-favored equilibrium |
| `\ce{A <<=> B}` | left-favored equilibrium |
| `\ce{A <-> B}` | ↔ resonance |

### Conditions on arrows

```
\ce{A ->[\text{above}][\text{below}] B}
```

Examples:
- `\ce{N2 + 3H2 ->[\text{Fe cat.}][\Delta] 2NH3}` — Haber process
- `\ce{CH3CHO ->[\ce{H2}][\text{Pd/C}] CH3CH2OH}` — catalytic hydrogenation

The `\ce{}` works recursively, so you can put species names above/below arrows.

## Bonds (in line notation)

| Input | Renders |
|-------|---------|
| `\ce{H-O-H}` | H—O—H |
| `\ce{C=C}` | C=C |
| `\ce{N#N}` | N≡N |

## Phases / arrows on side products

| Input | Meaning |
|-------|---------|
| `\ce{AgCl v}` | precipitate (down arrow) |
| `\ce{H2 ^}` | gas evolution (up arrow) |

## Common gotchas

- **Don't write `\ce{Fe3+}`** — `3` becomes a subscript, giving Fe₃⁺. Write `\ce{Fe^3+}` or `\ce{Fe^{3+}}`.
- **Don't escape parentheses** — `\ce{(NH4)2SO4}` works, you don't need `\(` `\)`.
- **Spaces matter inside `\ce{}`** — they separate species. `\ce{HCl + NaOH}` correct; `\ce{HCl+NaOH}` may render oddly.
- **Greek letters and Δ** — use `\Delta`, `\alpha`, `\beta` etc., they work inside `\ce{}` for arrow conditions.
- **Multi-letter element symbols** — capitalization matters: `Co` is cobalt; `CO` is carbon monoxide.

## Example: Multi-step reaction

```
\ce{CH3CH2OH ->[\text{KMnO4}][\text{H+}] CH3CHO ->[\text{KMnO4}][\text{H+}] CH3COOH}
```

Renders the oxidation of ethanol → acetaldehyde → acetic acid with conditions over each arrow.

## Example: Equilibrium with K expression

```
\ce{N2(g) + 3H2(g) <=> 2NH3(g)}

K_c = \frac{[\ce{NH3}]^2}{[\ce{N2}][\ce{H2}]^3}
```

You can mix `\ce{}` inside regular math expressions — useful for equilibrium constants and rate laws.
