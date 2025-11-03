# Tailwind → vanilla-extract Migration Diff

## Stage 1: Component-by-Component Visual Parity Analysis

### Critical Token Mismatches

| Token | Original (Tailwind) | Current (VE) | Status | Impact |
|-------|-------------------|--------------|--------|---------|
| `radius.xl` | `16px` | `20px` | ❌ MISMATCH | High - drawer/card corners too round |
| `radius.lg` | `12px` | `14px` | ❌ MISMATCH | Medium - hover card corners too round |
| `radius.md` | `10px` | `10px` | ✅ MATCH | - |
| `radius.sm` | `6px` | `6px` | ✅ MATCH | - |
| `shadow.card` | `0 4px 16px rgba(0,0,0,0.08)` | `0 6px 16px rgba(0,0,0,0.24)` | ❌ MISMATCH | Medium - shadows too heavy |
| Color format | Space-separated RGB: `"250 242 244"` | Hex/rgba: `"#faf2f4"` | ⚠️ DIFFERENT | High - breaks Tailwind alpha syntax |
| `primaryLight` token | Exists (250 242 244) | Renamed to `surface` | ⚠️ RENAME | Medium - semantic mismatch |
| `primaryDark` token | Exists (40 18 32) | Missing, only in overlay | ⚠️ RENAME | Medium - semantic mismatch |

### Component Analysis

#### 1. Drawer Backdrop

| Aspect | Original Tailwind | Current VE (`drawerBackdrop`) | Match? | Notes |
|--------|------------------|-------------------------------|--------|-------|
| Background | `bg-primary-dark/45` = `rgba(40,18,32,0.45)` | `tokens.color.overlay.medium` = `rgba(40,18,32,0.45)` | ✅ | Color correct |
| Blur | `backdrop-blur-md` = `blur(12px)` | `backdropFilter: "blur(12px)"` + `-webkit-` | ✅ | Correct w/ Safari fallback |
| Position | `absolute inset-0` (implied) | `position: absolute, inset: 0` | ✅ | Correct |
| Pointer events | `pointer-events-none` | `pointerEvents: "none"` | ✅ | Correct |

**Verdict**: ✅ **PIXEL-PERFECT**

---

#### 2. Drawer Panel (Open State)

| Aspect | Original Tailwind | Current VE (`drawerPanel`) | Match? | Notes |
|--------|------------------|---------------------------|--------|-------|
| Border radius | `rounded-xl` = `16px` | `tokens.radius.xl` = `20px` | ❌ | **4px too large!** |
| Border | `border border-border` = `1px solid rgba(199,201,205,1)` | `1px solid ${tokens.color.border}` = same | ✅ | Correct |
| Background | `bg-primary-light/98` = `rgba(250,242,244,0.98)` | `tokens.color.surface` = `rgba(250,242,244,0.98)` | ✅ | Correct |
| Shadow | `shadow-[0_12px_48px_rgba(0,0,0,0.35)]` | `boxShadow: "0 12px 48px rgba(0,0,0,0.35)"` | ✅ | Exact match |
| Overflow | `overflow-hidden` | `overflow: "hidden"` | ✅ | Correct |
| Pointer events | `pointer-events-auto` | `pointerEvents: "auto"` | ✅ | Correct |

**Verdict**: ⚠️ **NEARLY PERFECT** — border radius 4px too large

---

#### 3. Side Panel (Closed State)

| Aspect | Original Tailwind | Current VE (`sidePanel`) | Match? | Notes |
|--------|------------------|-------------------------|--------|-------|
| Border left | `border-l border-border` = `1px solid rgba(199,201,205,1)` | `1px solid rgba(199,201,205,0.6)` | ❌ | **Should be 100% opacity, not 60%!** |
| Background | `bg-primary-light/96` = `rgba(250,242,244,0.96)` | `tokens.color.surfaceAlt` = `rgba(250,242,244,0.96)` | ✅ | Correct |
| Backdrop blur | `backdrop-blur-md` = `blur(12px)` | `backdropFilter: "blur(12px)"` + `-webkit-` | ✅ | Correct w/ Safari fallback |
| Shadow | `shadow-[0_0_32px_rgba(0,0,0,0.25)]` | `boxShadow: "0 0 32px rgba(0,0,0,0.25)"` | ✅ | Exact match |
| Width (mobile) | `w-full` = `100%` | `width: "100%"` | ✅ | Correct |
| Width (md) | `md:w-[440px]` | `@media (min-width: 768px): width: "440px"` | ✅ | Correct |
| Width (lg) | `lg:w-[500px]` | `@media (min-width: 1024px): width: "500px"` | ✅ | Correct |
| Pointer events | `pointer-events-auto` | `pointerEvents: "auto"` | ✅ | Correct |

**Verdict**: ⚠️ **NEAR MISS** — border-left opacity wrong (60% vs 100%)

---

#### 4. Drawer Container Transitions

| Aspect | Original Tailwind | Current VE (`drawer` recipe) | Match? | Notes |
|--------|------------------|----------------------------|--------|-------|
| Transition | `transition-transform duration-200 ease-out` (implied) | `transition: transform 200ms ease-out` | ✅ | Correct |
| Transform (open) | `translateX(0)` (implied) | `transform: "translateX(0)"` | ✅ | Correct |
| Transform (closed) | `translateX(100%)` (implied) | `transform: "translateX(100%)"` | ✅ | Correct |
| will-change | Not set | Not set | ⚠️ | Should add for performance |

**Verdict**: ✅ **CORRECT** — could add `will-change: transform` for perf

---

#### 5. Hover Card

| Aspect | Original Tailwind | Current VE (`hoverCard`) | Match? | Notes |
|--------|------------------|------------------------|--------|-------|
| Shadow | `shadow-md` = `0 4px 6px rgba(0,0,0,0.1)` (Tailwind default) | `tokens.shadow.md` = `0 6px 16px rgba(0,0,0,0.24)` | ❌ | **VE shadow is heavier/darker** |
| Cursor | `cursor-default` | `cursor: "default"` | ✅ | Present |
| Border radius | `rounded-lg` (implied) = `12px` | `tokens.radius.lg` = `14px` | ❌ | **2px too large** |
| Border | `border border-border` | `1px solid ${tokens.color.border}` | ✅ | Correct |
| Background | `bg-primary-light` or similar | `tokens.color.surface` | ✅ | Correct |
| Pointer events | `pointer-events-auto` | `pointerEvents: "auto"` | ✅ | Correct |

**Verdict**: ⚠️ **MISMATCHES** — shadow too heavy, radius too large

---

#### 6. Playlist Items

| Aspect | Original Tailwind | Current VE (`playlistItem`) | Match? | Notes |
|--------|------------------|---------------------------|--------|-------|
| Padding | `p-2` = `8px` | `padding: tokens.space.sm` = `8px` | ✅ | Correct |
| Border radius | `rounded-md` = `10px` | `tokens.radius.md` = `10px` | ✅ | Correct |
| Transition | `transition-colors` | `transition: background 120ms` | ⚠️ | VE only transitions bg, not color |
| Hover bg | `hover:bg-gray-100` = `rgba(243,244,246,1)` | `tokens.color.overlay.light` = `rgba(40,18,32,0.3)` | ❌ | **WRONG COLOR! Should be light gray, not dark overlay** |
| Focused bg | `bg-black/[0.08]` = `rgba(0,0,0,0.08)` | `tokens.color.overlay.light` = `rgba(40,18,32,0.3)` | ❌ | **Too dark! Should be subtle black tint** |

**Verdict**: ❌ **BROKEN** — hover/focus colors completely wrong (dark overlay instead of light gray/black tint)

---

#### 7. Buttons (Playlist/Hover)

| Aspect | Original Tailwind | Current VE (`iconButton`) | Match? | Notes |
|--------|------------------|--------------------------|--------|-------|
| Padding | `p-2` = `8px` | Uses `buttonRecipe` with overrides | ⚠️ | Different approach |
| Hover bg | `hover:bg-gray-100` = `rgba(243,244,246,1)` | `buttonRecipe ghost tone`: `overlay.light` | ❌ | **Same issue as playlist items** |
| Transition | `transition-colors` | `transition: background, color, box-shadow (all 120ms)` | ⚠️ | More comprehensive but slower |

**Verdict**: ❌ **BROKEN** — hover color mismatch

---

## Ranked Regressions (Most → Least Impact)

1. **🔴 CRITICAL: Playlist/button hover colors** — Using dark overlay (`rgba(40,18,32,0.3)`) instead of light gray (`rgba(243,244,246,1)`). Completely changes visual appearance.

2. **🔴 CRITICAL: Border radius mismatch** — `xl: 20px` (should be 16px) and `lg: 14px` (should be 12px). Drawer and cards look "too round."

3. **🟡 HIGH: Side panel border opacity** — Using 60% opacity instead of 100% for border-left. Makes border too subtle.

4. **🟡 HIGH: Shadow weight** — Token `shadow.md` is heavier than Tailwind's default (`0.24` alpha vs `0.1`). Cards/hovers appear "floatier."

5. **🟡 MEDIUM: Color format incompatibility** — Original used space-separated RGB for Tailwind's alpha syntax. New tokens use hex/rgba, breaking the pattern for future Tailwind usage (if ever needed).

6. **🟢 LOW: Transition properties** — VE uses `background` only instead of `colors` (which includes background, border, text color). Minor but could affect future styling.

7. **🟢 LOW: Missing `will-change`** — Could add `will-change: transform` to drawer for better animation performance.

---

## Root Cause Analysis

### Why did these mismatches happen?

1. **Token redesign without reference**: New tokens were created from scratch rather than transcribing the exact Tailwind values. Border radii were "guessed" or "improved" rather than matched.

2. **Semantic token confusion**: The original `hover:bg-gray-100` (a *light* gray background for hover states) was mapped to `overlay.light` (a *dark* semi-transparent overlay). The token *name* matched semantically, but the *color* is opposite.

3. **Shadow token consolidation**: Created a single `shadow.md` token instead of matching Tailwind's specific shadow scale. Tailwind's `shadow-md` is subtle; the new token is heavier.

4. **Border opacity creative liberty**: Side panel border was given 60% opacity for a "softer" look, but original was 100%.

---

## Recommendations

### Stage 2: Fix tokens to match original exactly

- Revert `radius.xl` to `16px` (currently `20px`)
- Revert `radius.lg` to `12px` (currently `14px`)
- Create `shadow.card` with exact Tailwind `shadow-md` value: `0 4px 6px rgba(0,0,0,0.1)`
- Add hover state tokens:
  - `color.hover.light` = `"rgba(243, 244, 246, 1)"` (gray-100)
  - `color.hover.focus` = `"rgba(0, 0, 0, 0.08)"` (black @ 8%)
- Fix side panel border to 100% opacity
- Consider restoring space-separated RGB format if Tailwind interop is desired

### Stage 3: Create recipes that use corrected tokens

- `backdropRecipe` ✅ (already correct)
- `panelRecipe` with exact border radius
- `buttonBare` recipe for list/playlist items with correct hover colors
- `transitionSlide` utility with `will-change`

### Stage 4: Apply to components

- Update all references to use new recipes
- Remove hardcoded rgba values
- Validate against original Tailwind classes

### Stage 5: Visual verification

- Use Playwright to capture screenshots before/after
- Compare drawer open/closed, hover states, playlist interactions
- Ensure pixel-perfect match (or document acceptable 1-2px anti-aliasing differences)
