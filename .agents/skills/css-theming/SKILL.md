---
description: CSS variables enforcement for a more sustainable and themeable codebase
---

# CSS Variable Enforcement

## Description
This skill ensures that all changes to CSS code use CSS root variables (`var(--variable-name)`) rather than hardcoding numerical values, colors, or fonts. This promotes code maintainability, consistency, and easy theming across the application.

## Instructions
1. **Never use hardcoded values** for common design properties (e.g., colors, spacing, borders, typography) in CSS or inline styles when a CSS variable could be used.
2. **Check for existing variables:** Before adding a new style, review `frontend/src/styles/variables.css` (or `frontend/src/index.css`) to find the appropriate existing variable.
3. **Use established variables:**
    *   **Colors**: Use semantic names like `var(--bg-color)`, `var(--text-primary)`, `var(--accent-primary)`. Avoid hardcoded Hex/RGB.
    *   **Spacing**: Use spacing tokens like `var(--spacing-2)`, `var(--spacing-4)` instead of raw `px` or `rem`.
    *   **Radii**: Use border-radius variables like `var(--radius-md)`.
    *   **Shadows**: Use box-shadow variables like `var(--shadow-lg)`.
    *   **Fonts**: Use `var(--font-family)`, `var(--font-weight-medium)`, etc.
4. **Create new variables responsibly:** If you need a value that does not exist in the current variable scale, **do not hardcode it**. Instead, propose adding a new CSS variable to the `:root` block in the appropriate variables file, then use that variable in your CSS.
5. **Refactoring:** When modifying existing CSS that contains hardcoded values, update them to use corresponding variables whenever possible.
