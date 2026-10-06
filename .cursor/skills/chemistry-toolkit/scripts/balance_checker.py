#!/usr/bin/env python3
"""
Chemical equation balancer and verifier.

Usage:
    python balance_checker.py "Fe + O2 -> Fe2O3"
        Solve for the smallest positive integer coefficients that balance the equation.

    python balance_checker.py --check "4 Fe + 3 O2 -> 2 Fe2O3"
        Verify that the given coefficients balance the equation. Reports per-element counts.

Supports:
    - Element subscripts: H2O, Fe2O3, C6H12O6
    - Parentheses with subscripts: Ca(OH)2, Al2(SO4)3, Fe(NO3)3
    - Hydrate dots: CuSO4.5H2O  or  CuSO4·5H2O
    - Charged species: written as Fe^3+ or SO4^2- (charge is parsed but not used for balancing)
    - Reaction arrow: ->  or  =  or  <=>  (all treated the same for balancing)

Notes:
    - The script does not balance redox half-reactions with electrons. Provide a full neutral equation.
    - State labels like (s), (l), (g), (aq) are stripped and ignored.
"""

import sys
import re
from fractions import Fraction
from math import gcd
from functools import reduce


# ---------- Parsing ----------

ELEMENT_RE = re.compile(r"([A-Z][a-z]?)(\d*)")
TOKEN_RE = re.compile(r"([A-Z][a-z]?|\(|\)|\d+)")


def parse_formula(formula: str) -> dict:
    """Parse a single chemical formula into {element: count}.

    Handles nested parentheses and hydrate dots (e.g. CuSO4.5H2O).
    Charge specifiers like ^2+ or ^- are stripped (they don't affect element balancing).
    """
    # Strip state labels: (s), (l), (g), (aq)
    formula = re.sub(r"\((?:s|l|g|aq)\)", "", formula)
    # Strip charge specifiers: ^2+, ^-, ^3+, etc.
    formula = re.sub(r"\^[\d]*[+\-]", "", formula)
    # Normalize hydrate dots
    formula = formula.replace("·", ".").replace("•", ".")

    # Split on hydrate dots and accumulate
    parts = formula.split(".")
    total = {}
    for part in parts:
        # If the part starts with a number, that's a hydrate multiplier
        m = re.match(r"^(\d+)(.*)$", part)
        if m:
            mult = int(m.group(1))
            sub_counts = _parse_simple(m.group(2))
        else:
            mult = 1
            sub_counts = _parse_simple(part)
        for el, n in sub_counts.items():
            total[el] = total.get(el, 0) + mult * n
    return total


def _parse_simple(formula: str) -> dict:
    """Parse a formula segment with parentheses but no hydrate dots."""
    tokens = TOKEN_RE.findall(formula)
    stack = [{}]
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok == "(":
            stack.append({})
            i += 1
        elif tok == ")":
            # Look ahead for a multiplier
            mult = 1
            if i + 1 < len(tokens) and tokens[i + 1].isdigit():
                mult = int(tokens[i + 1])
                i += 2
            else:
                i += 1
            top = stack.pop()
            for el, n in top.items():
                stack[-1][el] = stack[-1].get(el, 0) + n * mult
        elif tok[0].isupper():
            # Element symbol; look ahead for subscript
            count = 1
            if i + 1 < len(tokens) and tokens[i + 1].isdigit():
                count = int(tokens[i + 1])
                i += 2
            else:
                i += 1
            stack[-1][tok] = stack[-1].get(tok, 0) + count
        else:
            # Stray digit — shouldn't happen with well-formed input
            i += 1
    if len(stack) != 1:
        raise ValueError(f"Mismatched parentheses in {formula!r}")
    return stack[0]


def parse_species(s: str):
    """Parse one species token like '3 Fe2O3' or '2H2O' into (coefficient, formula_str, counts)."""
    s = s.strip()
    m = re.match(r"^(\d+)\s*(.+)$", s)
    if m and not s[0].isalpha():
        coef = int(m.group(1))
        formula = m.group(2).strip()
    else:
        coef = 1
        formula = s
    return coef, formula, parse_formula(formula)


def parse_equation(eqn: str):
    """Parse a full equation string into (left_species, right_species).

    Each species is (coefficient, formula_string, element_counts_dict).
    """
    # Normalize arrows to a single delimiter
    for arrow in ["<=>", "<->", "->", "=>", "="]:
        if arrow in eqn:
            eqn = eqn.replace(arrow, "|||")
            break
    if "|||" not in eqn:
        raise ValueError("No reaction arrow found. Use ->, =>, =, or <=>")
    left_str, right_str = eqn.split("|||", 1)

    left = [parse_species(s) for s in left_str.split("+")]
    right = [parse_species(s) for s in right_str.split("+")]
    return left, right


# ---------- Balancing ----------

def _lcm(a, b):
    return a * b // gcd(a, b)


def balance(eqn: str):
    """Find smallest positive integer coefficients that balance the equation.

    Returns (left_species_with_coefs, right_species_with_coefs) where each entry is
    (coefficient, formula_string).
    """
    left, right = parse_equation(eqn)
    species = left + right
    n = len(species)
    sign = [1] * len(left) + [-1] * len(right)

    # Collect all elements
    elements = sorted({el for _, _, counts in species for el in counts})
    if not elements:
        raise ValueError("No elements found")

    # Build coefficient matrix M (rows = elements, columns = species)
    # We want M @ x = 0 with x > 0. Solve nullspace.
    M = [[Fraction(sign[j] * species[j][2].get(el, 0)) for j in range(n)] for el in elements]

    # Gaussian elimination over rationals
    rows = len(M)
    pivots = []
    pivot_cols = []
    r = 0
    for c in range(n):
        # find pivot
        piv = None
        for rr in range(r, rows):
            if M[rr][c] != 0:
                piv = rr
                break
        if piv is None:
            continue
        M[r], M[piv] = M[piv], M[r]
        # normalize
        pv = M[r][c]
        M[r] = [x / pv for x in M[r]]
        # eliminate
        for rr in range(rows):
            if rr != r and M[rr][c] != 0:
                factor = M[rr][c]
                M[rr] = [M[rr][k] - factor * M[r][k] for k in range(n)]
        pivots.append(r)
        pivot_cols.append(c)
        r += 1

    free_cols = [c for c in range(n) if c not in pivot_cols]
    if not free_cols:
        raise ValueError("Equation cannot be balanced (no free parameter / overdetermined)")
    if len(free_cols) > 1:
        # Underdetermined — pick simplest by setting all free vars to 1
        pass

    # Set last free var to 1, others to 0; back-substitute
    x = [Fraction(0)] * n
    x[free_cols[-1]] = Fraction(1)
    for f in free_cols[:-1]:
        x[f] = Fraction(0)
    for i, pc in enumerate(pivot_cols):
        # M is in RREF; x[pc] = -sum(M[i][f] * x[f] for f in free_cols)
        x[pc] = -sum(M[i][f] * x[f] for f in free_cols)

    # If any are zero or negative, the equation isn't balanceable to positive integers
    if any(v <= 0 for v in x):
        # Try flipping sign
        x = [-v for v in x]
        if any(v <= 0 for v in x):
            raise ValueError("No positive-integer solution exists; check that all species are correct.")

    # Scale to integers: multiply by LCM of denominators
    lcm_denom = reduce(_lcm, (v.denominator for v in x), 1)
    coefs = [int(v * lcm_denom) for v in x]
    # Reduce by GCD
    g = reduce(gcd, coefs)
    coefs = [c // g for c in coefs]

    left_out = [(coefs[i], species[i][1]) for i in range(len(left))]
    right_out = [(coefs[len(left) + i], species[len(left) + i][1]) for i in range(len(right))]
    return left_out, right_out


# ---------- Verification ----------

def verify(eqn: str):
    """Check whether an equation as written balances. Returns (ok, per_element_table)."""
    left, right = parse_equation(eqn)
    elements = sorted({el for _, _, counts in left + right for el in counts})
    table = []
    ok = True
    for el in elements:
        l = sum(coef * counts.get(el, 0) for coef, _, counts in left)
        r = sum(coef * counts.get(el, 0) for coef, _, counts in right)
        table.append((el, l, r, l == r))
        if l != r:
            ok = False
    return ok, table


# ---------- Output ----------

def format_eqn(left, right, arrow="->"):
    def fmt_side(side):
        parts = []
        for coef, formula in side:
            if coef == 1:
                parts.append(formula)
            else:
                parts.append(f"{coef} {formula}")
        return " + ".join(parts)
    return f"{fmt_side(left)} {arrow} {fmt_side(right)}"


def main():
    args = sys.argv[1:]
    check_mode = False
    if args and args[0] == "--check":
        check_mode = True
        args = args[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    eqn = " ".join(args)

    if check_mode:
        try:
            ok, table = verify(eqn)
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(2)
        print(f"Equation: {eqn}")
        print()
        print(f"{'Element':<10}{'Left':>8}{'Right':>8}{'Match':>8}")
        print("-" * 34)
        for el, l, r, match in table:
            print(f"{el:<10}{l:>8}{r:>8}{'OK' if match else 'MISMATCH':>8}")
        print()
        print("BALANCED" if ok else "NOT BALANCED")
        sys.exit(0 if ok else 1)
    else:
        try:
            left, right = balance(eqn)
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(2)
        balanced_str = format_eqn(left, right)
        print(f"Input:    {eqn}")
        print(f"Balanced: {balanced_str}")
        print()
        # Verify our own answer
        ok, table = verify(balanced_str)
        print(f"{'Element':<10}{'Left':>8}{'Right':>8}{'Match':>8}")
        print("-" * 34)
        for el, l, r, match in table:
            print(f"{el:<10}{l:>8}{r:>8}{'OK' if match else 'MISMATCH':>8}")
        print()
        print("VERIFIED" if ok else "VERIFICATION FAILED")
        sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
