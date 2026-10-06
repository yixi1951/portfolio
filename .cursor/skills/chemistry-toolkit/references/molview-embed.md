# MolView Sketcher Embed Reference

The MolView sketcher is a 2D structure-drawing web component. Use this when the user wants to **draw or edit** structures interactively (not just view).

## Why this requires user setup

MolView's sketcher API requires a **client ID** (UUID) tied to a MolView account. By default, only signed-in MolView subscribers can use the sketcher inside an embed. For general public access on a deployed site, the developer needs a domain license from MolView.

**Walk the user through this BEFORE writing embed code:**

1. Sign up or sign in at https://app.molview.com/sign-in
2. Navigate to **Account settings** → **Developer tools**
3. Request a client ID — you'll get a UUID
4. Confirm: do they have a subscription, or are they only testing locally? If their use case is "share this with my class" and the students aren't subscribed, the sketcher won't work for them. Flag this clearly.

If the user wants to *view* structures (not edit), redirect them to 3Dmol.js (3D) or RDKit-rendered SVG (2D static). No accounts needed.

## Minimal embed

```html
<molview-sketcher id="sketcher" style="width:100%; height:600px; display:block;"></molview-sketcher>
<script type="module">
  import { Sketcher } from 'https://app.molview.com/api.js?id=PASTE_CLIENT_ID_HERE';
  // Importing registers the <molview-sketcher> custom element.
  // The element in the HTML above will hydrate automatically.
</script>
```

## Reading what the user drew

```javascript
const sketcher = document.getElementById("sketcher");

// Export as SMILES
const smiles = await sketcher.export("smiles");

// Export full diagram object (atoms, bonds, marks, arrows, etc.)
const diagram = await sketcher.save();
```

## Loading a starting structure

```javascript
// Load from a saved diagram object
await sketcher.load(diagram);

// Note: there's no direct "load from SMILES" method documented.
// If you need to seed with a SMILES, you may need to construct the diagram
// object yourself using the Diagram interface, or have the user paste/draw it.
```

## Customization via set_props

```javascript
await sketcher.set_props({
  style: {
    typeface: "serif",   // or "sans-serif"
    atom_color: "black"  // or undefined for CPK coloring
  },
  toolset: {
    atom: { mark: true },
    arrow: { type: ["electron_single", "electron_pair"] }
  }
});
```

Useful toolset restrictions:
- Mechanism-only mode: enable arrow tools, disable structure editing
- Annotation-only mode: enable atom marks, disable bond changes
- Read-only display: set all toolset entries to false

## Debugging

- **Sketcher renders blank**: check that the client ID UUID is correct in the import URL
- **"Subscription required" message**: the user viewing the page isn't a MolView subscriber; either they need to subscribe, or you need a domain license
- **Element not hydrating**: confirm the script tag has `type="module"` and runs after the `<molview-sketcher>` tag exists in the DOM

## When NOT to use MolView

- The user just wants to see a structure (use RDKit → SVG)
- The user wants 3D rotation (use 3Dmol.js)
- The user is on a free tier and wants public sharing (the API is gated)
- The task is generating many structures programmatically (use RDKit headless)
