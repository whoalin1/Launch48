---
name: ui-consistency
description: Guidelines for ensuring new UI components perfectly match the existing site design, including standard buttons, icons, and avoiding placeholder code in launch48.
---

# UI Consistency Skill for launch48

When building or modifying UI components in this repository, you must strictly adhere to the launch48 design system:

1. **Follow the launch48 Design System**:
   - For complete guidelines, tokens, recipes, and motion physics, refer to the [launch48-design skill](../launch48-design/SKILL.md).

2. **Never Guess Icons or SVG Paths**:
   - Icons must come exclusively from `@phosphor-icons/react` (`Plus`, `ArrowUpRight`).
   - Use SSR imports (`@phosphor-icons/react/dist/ssr/*`) in Server Components and CSR imports (`@phosphor-icons/react/dist/csr/*`) in Client Components.

3. **Buttons & Actions**:
   - Use the `.checkout-link` pill button pattern (`border-radius: 999px`) with its magnetic spring hover physics from `motion/react`.
   - Never invent arbitrary button styles or colors.

4. **Colors & Tokens**:
   - Strictly use `:root` CSS variables: `--canvas`, `--paper`, `--mist`, `--ink`, `--muted`, `--line`, and `--accent`.
   - Do not use Tailwind default palette colors (e.g., `blue-500`, `slate-700`).

5. **Motion & Accessibility**:
   - Always integrate `usePrefersReducedMotion()`. If reduced motion is active, disable 3D tilts, magnetic physics, and scroll scrubbing.

6. **Mobile Parity**:
   - Ensure all responsive elements degrade gracefully into clean, un-scrolled static stacks on mobile screens (`@media (max-width: 47.99rem)`).
