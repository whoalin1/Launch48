# Original User Request

## 2026-08-29T16:37:25Z

This is a single self-contained fix; keep it small and focused.

Rebuild the visual accompaniment for the launch48 sticky offer scroll section ("48 hours / $149 / 3 revisions") completely from scratch. Delete the cluttered card mockups and replace them with an ultra-minimalist, Apple-style presentation using 100% native frontend code and zero external AI generation.

Working directory: c:/Users/Alin/Documents/launch48
Integrity mode: development

## Requirements

### R1. Clean Slate & Removal of Legacy Clutter
- Remove all complex card mockups, mock wireframes, countdown widgets, and external image/video dependencies from the Offer sequence.
- Zero reliance on Higgsfield, stock images, or video players.

### R2. Ultra-Minimalist Apple-Style Visual System
- Design a refined, restrained visual accompaniment for the 3 beats:
  1. 48 hours — Sleek typographic badge / precision geometric glyph or minimalist sprint indicator.
  2. $149 one price — Clean, understated flat pricing pill or monochrome token element.
  3. 3 revisions — Minimal 3-step geometric progression / micro-pagination dot matrix.
- Aesthetics: Understated elegance, whisper-thin 1px border lines, subtle matte paper/canvas contrast, generous whitespace, monochrome ink with restrained volt-lime (#b8f34a) accents.

### R3. Seamless Scroll Physics & Responsiveness
- Synchronize smooth, subtle transitions with the 385svh sticky scroll beats without disorienting 3D tumbling or large translations.
- 60fps jitter-free performance across all devices.
- Clean mobile layout and full reduced-motion accessibility.

## Acceptance Criteria

### Visual Quality
- [ ] No fake browser chrome, mock traffic lights, or artificial dashboard clutter.
- [ ] No external image assets, video tags, or AI-generated media.
- [ ] Minimalist Apple aesthetic: clean geometric lines, restrained typography, and intentional whitespace.
- [ ] Seamless in-place or subtle layered transitions between the 3 offer scenes.

### Technical & Engineering
- [ ] npm run typecheck passes with 0 errors.
- [ ] npm run lint passes with 0 warnings/errors.
- [ ] npm run build succeeds cleanly.

## 2026-08-29T16:42:24Z

USER FEEDBACK UPDATE (CRITICAL):
The user explicitly clarified the core issues:
1. "The cards have too much information" -> Keep each visual element drastically stripped down and punchy. Minimalist Apple style: zero walls of text, zero fake dashboard forms/checklists. Maximum breathing room, pure typographic and geometric restraint.
2. "The transitions aren't cool enough" -> Make the transitions between the 3 beats (48h -> $149 -> 3 revisions -> lockup) feel genuinely cool, fluid, and cinematic. Think Apple hardware/software keynotes: seamless spatial morphing, elegant scale and perspective shifts, kinetic SVG geometry, and buttery spring physics. Make the choreography exciting and refined, not a boring linear fade or generic slide.
