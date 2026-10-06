# 3Dmol.js Recipes

Common patterns for the interactive 3D viewer. Drop these into HTML artifacts.

## Setup boilerplate

Always use this scaffolding:

```html
<div id="viewer" style="width: 100%; height: 500px; position: relative;"></div>
<script src="https://3dmol.org/build/3Dmol-min.js"></script>
<script>
  const viewer = $3Dmol.createViewer("viewer", { backgroundColor: "white" });
  // ... your code ...
  viewer.zoomTo();
  viewer.render();
</script>
```

## Loading molecules

### From PubChem CID (best for known organic compounds)

```javascript
$3Dmol.download("cid:2244", viewer, {}, () => {  // aspirin
  viewer.setStyle({}, { stick: {} });
  viewer.zoomTo();
  viewer.render();
});
```

Common CIDs: water=962, methane=297, ethanol=702, benzene=241, glucose=5793, caffeine=2519, aspirin=2244, ibuprofen=3672.

### From PDB (proteins, nucleic acids)

```javascript
$3Dmol.download("pdb:1CRN", viewer, {}, () => {
  viewer.setStyle({}, { cartoon: { color: "spectrum" } });
  viewer.zoomTo();
  viewer.render();
});
```

### From a MOL/SDF block (when you already have coordinates)

Generate the MOL block with RDKit first:

```python
from rdkit import Chem
from rdkit.Chem import AllChem
m = Chem.MolFromSmiles("CCO")
m = Chem.AddHs(m)
AllChem.EmbedMolecule(m, randomSeed=42)
AllChem.MMFFOptimizeMolecule(m)
print(Chem.MolToMolBlock(m))
```

Then paste into the artifact:

```javascript
const molBlock = `... paste output here ...`;
viewer.addModel(molBlock, "mol");
viewer.setStyle({}, { stick: {} });
viewer.zoomTo();
viewer.render();
```

### From XYZ coords

```javascript
const xyz = `3
water
O    0.000    0.000    0.000
H    0.757    0.586    0.000
H   -0.757    0.586    0.000`;
viewer.addModel(xyz, "xyz");
```

## Style options

```javascript
// Stick (line drawing of bonds)
viewer.setStyle({}, { stick: { radius: 0.15 } });

// Ball-and-stick
viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { scale: 0.25 } });

// Space-filling (van der Waals)
viewer.setStyle({}, { sphere: {} });

// Wireframe (fastest)
viewer.setStyle({}, { line: {} });

// Color a specific element
viewer.setStyle({ elem: "C" }, { stick: { color: "gray" } });
viewer.setStyle({ elem: "O" }, { stick: { color: "red" } });

// Highlight a specific atom by index
viewer.setStyle({ serial: 5 }, { sphere: { color: "yellow", scale: 0.5 } });
```

## Surfaces

```javascript
// Van der Waals surface
viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.3, color: "white" });

// Solvent-accessible surface (slow on big molecules)
viewer.addSurface($3Dmol.SurfaceType.SAS, { opacity: 0.5 });

// Color by electrostatic potential (requires charges in model)
viewer.addSurface($3Dmol.SurfaceType.VDW, {
  opacity: 0.7,
  colorscheme: { gradient: "rwb", min: -0.5, max: 0.5, prop: "partialCharge" }
});
```

Surfaces are expensive — skip on mobile or for molecules with >100 atoms.

## Labels

```javascript
viewer.addLabel("OH", {
  position: { x: 1.2, y: 0.5, z: 0.0 },
  fontSize: 14,
  fontColor: "black",
  backgroundColor: "white",
  borderColor: "black",
  borderThickness: 1
});
```

To label by atom index, get the atom's position from the model:

```javascript
const atoms = viewer.getModel().selectedAtoms({ serial: 3 });
viewer.addLabel("C3", { position: atoms[0], fontSize: 12 });
```

## Animations

For multi-frame trajectories (e.g., reaction coordinate):

```javascript
viewer.addModelsAsFrames(multiFrameMolBlock, "mol");
viewer.setStyle({}, { stick: {} });
viewer.animate({ loop: "forward", reps: 0, interval: 100 });
viewer.render();
```

## Multi-molecule comparison

```javascript
viewer.addModel(reactantMol, "mol");
viewer.addModel(productMol, "mol");
viewer.setStyle({ model: 0 }, { stick: { color: "red" } });
viewer.setStyle({ model: 1 }, { stick: { color: "blue" } });
```

Or use two separate viewer divs side-by-side for clearer side-by-side comparison.

## Performance tips

- Mobile: cap height at 400px, skip surfaces, prefer line over sphere
- Big systems (>500 atoms): use `cartoon` for protein backbone instead of stick
- Many models loaded: call `viewer.removeAllModels()` before adding new ones
