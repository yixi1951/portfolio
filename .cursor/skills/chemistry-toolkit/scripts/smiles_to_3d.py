#!/usr/bin/env python3
"""
SMILES → 3D conversion: generate 3D coordinates from a 2D SMILES string and
output either a MOL block (for embedding in 3Dmol.js) or a self-contained
HTML artifact with an interactive 3D viewer.

Open-source dependencies (all permissive licenses):
  - RDKit (BSD-3-Clause):       https://github.com/rdkit/rdkit
    Used for SMILES parsing, 3D embedding (ETKDG), and force-field optimization.
  - 3Dmol.js (BSD-3-Clause):    https://github.com/3dmol/3Dmol.js
    Embedded via CDN in the generated HTML for the interactive viewer.

Algorithm reference:
  Riniker & Landrum, "Better Informed Distance Geometry: Using What We Know to
  Improve Conformation Generation", J. Chem. Inf. Model. 2015, 55, 12, 2562-2574.
  (This is the ETKDG method that RDKit's EmbedMolecule uses.)

Force fields:
  - MMFF94 (Halgren, J. Comput. Chem. 1996) — default, well-suited for organic molecules
  - UFF (Rappé et al., J. Am. Chem. Soc. 1992) — fallback for elements MMFF doesn't cover

Usage:
    # Print MOL block to stdout (paste into a 3Dmol.js viewer)
    python smiles_to_3d.py "CCO"

    # Write a self-contained HTML artifact with the molecule embedded
    python smiles_to_3d.py "CCO" --html ethanol.html

    # Multi-conformer search; keep the lowest-energy conformer
    python smiles_to_3d.py "CC(=O)Oc1ccccc1C(=O)O" --conformers 20 --html aspirin.html

    # Switch force field
    python smiles_to_3d.py "CCO" --force-field uff

Install RDKit if needed:
    pip install rdkit --break-system-packages
"""

import argparse
import json
import sys
from pathlib import Path


def _import_rdkit():
    """Import RDKit with a helpful error if missing."""
    try:
        from rdkit import Chem
        from rdkit.Chem import AllChem, rdMolDescriptors
        return Chem, AllChem, rdMolDescriptors
    except ImportError:
        sys.stderr.write(
            "RDKit is required. Install with:\n"
            "    pip install rdkit --break-system-packages\n"
        )
        sys.exit(1)


def smiles_to_3d(smiles: str, n_conformers: int = 1, force_field: str = "mmff", seed: int = 42):
    """Convert SMILES to a 3D-embedded RDKit Mol object.

    Returns:
        (mol, mol_block, formula, properties_dict)

    Raises ValueError if SMILES can't be parsed; RuntimeError if 3D embedding fails.
    """
    Chem, AllChem, rdMolDescriptors = _import_rdkit()

    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"Could not parse SMILES: {smiles!r}")

    # Add explicit hydrogens — needed for sensible 3D geometry
    mol_h = Chem.AddHs(mol)

    if n_conformers <= 1:
        # Single-conformer embedding
        params = AllChem.ETKDGv3()
        params.randomSeed = seed
        result = AllChem.EmbedMolecule(mol_h, params)
        if result == -1:
            # Retry with random coordinate fallback
            params.useRandomCoords = True
            result = AllChem.EmbedMolecule(mol_h, params)
            if result == -1:
                raise RuntimeError(
                    f"Could not generate 3D coordinates for {smiles!r}. "
                    "The molecule may have unusual topology or be too constrained."
                )
        # Energy minimize
        _optimize(mol_h, force_field, AllChem)
    else:
        # Multi-conformer search; keep lowest-energy
        params = AllChem.ETKDGv3()
        params.randomSeed = seed
        cids = list(AllChem.EmbedMultipleConfs(mol_h, numConfs=n_conformers, params=params))
        if not cids:
            params.useRandomCoords = True
            cids = list(AllChem.EmbedMultipleConfs(mol_h, numConfs=n_conformers, params=params))
            if not cids:
                raise RuntimeError(f"Could not generate any conformers for {smiles!r}")

        # Optimize all and pick lowest energy
        if force_field == "mmff":
            results = AllChem.MMFFOptimizeMoleculeConfs(mol_h)
        else:
            results = AllChem.UFFOptimizeMoleculeConfs(mol_h)

        # results is a list of (converged_flag, energy) tuples per cid
        energies = [(cid, res[1]) for cid, res in zip(cids, results) if res[0] == 0]
        if not energies:
            # None converged; just take the first one
            best_cid = cids[0]
            sys.stderr.write("Warning: no conformers fully converged; using first.\n")
        else:
            best_cid = min(energies, key=lambda x: x[1])[0]

        # Remove other conformers
        for cid in cids:
            if cid != best_cid:
                mol_h.RemoveConformer(cid)
        # Renumber the kept conformer to 0
        conf = mol_h.GetConformer(best_cid)
        conf.SetId(0)

    mol_block = Chem.MolToMolBlock(mol_h)
    formula = rdMolDescriptors.CalcMolFormula(mol_h)

    # Compute a few useful descriptors
    from rdkit.Chem import Descriptors
    props = {
        "smiles": smiles,
        "canonical_smiles": Chem.MolToSmiles(mol),
        "formula": formula,
        "molecular_weight": round(Descriptors.MolWt(mol_h), 2),
        "n_atoms": mol_h.GetNumAtoms(),
        "n_heavy_atoms": mol.GetNumHeavyAtoms(),
        "n_rotatable_bonds": rdMolDescriptors.CalcNumRotatableBonds(mol),
        "n_h_donors": rdMolDescriptors.CalcNumHBD(mol),
        "n_h_acceptors": rdMolDescriptors.CalcNumHBA(mol),
    }

    return mol_h, mol_block, formula, props


def _optimize(mol, force_field, AllChem):
    """Energy-minimize the molecule in place."""
    if force_field == "mmff":
        # MMFF94 — better for organic molecules
        success = AllChem.MMFFOptimizeMolecule(mol, maxIters=500)
        if success != 0:
            # MMFF didn't converge or doesn't support these elements; try UFF
            sys.stderr.write("MMFF94 optimization didn't fully converge; falling back to UFF.\n")
            AllChem.UFFOptimizeMolecule(mol, maxIters=500)
    elif force_field == "uff":
        AllChem.UFFOptimizeMolecule(mol, maxIters=500)
    else:
        raise ValueError(f"Unknown force field: {force_field!r}. Use 'mmff' or 'uff'.")


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__</title>
<style>
  body {
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    margin: 0;
    padding: 20px;
    background: #fafafa;
    color: #1a1a1a;
  }
  .wrap { max-width: 700px; margin: 0 auto; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .subtitle { color: #666; font-size: 13px; margin: 0 0 16px; }
  #viewer {
    width: 100%;
    height: 500px;
    position: relative;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
  }
  .hint { color: #888; font-size: 12px; margin: 8px 0 16px; }
  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  button {
    padding: 6px 12px;
    border: 1px solid #ccc;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    color: #333;
  }
  button:hover { background: #f0f0f0; }
  button.active { background: #2c4a6b; color: white; border-color: #2c4a6b; }
  .props {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 13px;
  }
  .props dl { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; }
  .props dt { color: #666; }
  .props dd { margin: 0; font-family: ui-monospace, "Menlo", monospace; font-size: 12px; word-break: break-all; }
  @media (max-width: 500px) {
    #viewer { height: 380px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <h1>__TITLE__</h1>
  <p class="subtitle">__FORMULA__</p>
  <div id="viewer"></div>
  <p class="hint">drag to rotate · scroll/pinch to zoom · right-click drag to pan</p>
  <div class="controls">
    <button id="btn-stick" class="active" onclick="setStyle('stick', this)">stick</button>
    <button id="btn-ballstick" onclick="setStyle('ball-stick', this)">ball &amp; stick</button>
    <button id="btn-sphere" onclick="setStyle('sphere', this)">space-filling</button>
    <button id="btn-line" onclick="setStyle('line', this)">wireframe</button>
    <button id="btn-surface" onclick="toggleSurface(this)">show surface</button>
  </div>
  <div class="props">
    <dl>__PROPS_DL__</dl>
  </div>
</div>

<script src="https://3dmol.org/build/3Dmol-min.js"></script>
<script>
  const molBlock = __MOL_BLOCK_JSON__;
  const viewer = $3Dmol.createViewer("viewer", { backgroundColor: "white" });
  viewer.addModel(molBlock, "mol");
  viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.0 } });
  viewer.zoomTo();
  viewer.render();

  let surfaceVisible = false;

  function setStyle(name, btn) {
    document.querySelectorAll(".controls button").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    viewer.setStyle({}, {});
    if (name === "stick") viewer.setStyle({}, { stick: { radius: 0.15 } });
    else if (name === "ball-stick") viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.25 } });
    else if (name === "sphere") viewer.setStyle({}, { sphere: { scale: 1.0 } });
    else if (name === "line") viewer.setStyle({}, { line: {} });
    viewer.render();
  }

  function toggleSurface(btn) {
    if (surfaceVisible) {
      viewer.removeAllSurfaces();
      btn.textContent = "show surface";
      btn.classList.remove("active");
      surfaceVisible = false;
    } else {
      viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.35, color: "white" });
      btn.textContent = "hide surface";
      btn.classList.add("active");
      surfaceVisible = true;
    }
    viewer.render();
  }
</script>
</body>
</html>
"""


def make_html_artifact(mol_block: str, props: dict, title: str = None) -> str:
    """Generate a self-contained HTML page with the molecule in an interactive 3D viewer."""
    if title is None:
        title = props.get("formula") or props.get("smiles") or "3D structure"

    # Build the properties display list
    label_map = {
        "smiles": "SMILES",
        "canonical_smiles": "Canonical SMILES",
        "formula": "Formula",
        "molecular_weight": "Mol. weight",
        "n_atoms": "Atoms (with H)",
        "n_heavy_atoms": "Heavy atoms",
        "n_rotatable_bonds": "Rotatable bonds",
        "n_h_donors": "H-bond donors",
        "n_h_acceptors": "H-bond acceptors",
    }
    dl_parts = []
    for key, label in label_map.items():
        if key in props:
            value = props[key]
            dl_parts.append(f"<dt>{label}</dt><dd>{value}</dd>")
    props_dl = "\n      ".join(dl_parts)

    # JSON-encode the MOL block so backticks, newlines, etc. are safe
    mol_json = json.dumps(mol_block)

    return (
        HTML_TEMPLATE
        .replace("__TITLE__", title)
        .replace("__FORMULA__", props.get("formula", ""))
        .replace("__MOL_BLOCK_JSON__", mol_json)
        .replace("__PROPS_DL__", props_dl)
    )


def main():
    p = argparse.ArgumentParser(
        description="Convert SMILES → 3D structure (MOL block or HTML artifact)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__.split("Usage:")[1] if "Usage:" in __doc__ else "",
    )
    p.add_argument("smiles", help="SMILES string of the molecule")
    p.add_argument("--html", metavar="PATH", help="Write a self-contained interactive HTML artifact to this path")
    p.add_argument("--mol", metavar="PATH", help="Write the MOL block to this path (otherwise prints to stdout)")
    p.add_argument("--conformers", type=int, default=1,
                   help="Number of conformers to generate; lowest-energy is kept (default: 1)")
    p.add_argument("--force-field", choices=["mmff", "uff"], default="mmff",
                   help="Force field for energy minimization (default: mmff)")
    p.add_argument("--seed", type=int, default=42, help="Random seed for embedding (default: 42)")
    p.add_argument("--title", help="Title for the HTML artifact")
    args = p.parse_args()

    try:
        _, mol_block, formula, props = smiles_to_3d(
            args.smiles,
            n_conformers=args.conformers,
            force_field=args.force_field,
            seed=args.seed,
        )
    except (ValueError, RuntimeError) as e:
        sys.stderr.write(f"Error: {e}\n")
        sys.exit(1)

    sys.stderr.write(f"Generated 3D structure: {formula} ({props['n_atoms']} atoms)\n")

    if args.html:
        html = make_html_artifact(mol_block, props, title=args.title)
        Path(args.html).write_text(html, encoding="utf-8")
        sys.stderr.write(f"Wrote HTML artifact: {args.html}\n")

    if args.mol:
        Path(args.mol).write_text(mol_block, encoding="utf-8")
        sys.stderr.write(f"Wrote MOL block: {args.mol}\n")

    if not args.html and not args.mol:
        # Default: print MOL block to stdout
        print(mol_block)


if __name__ == "__main__":
    main()
