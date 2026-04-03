---
description: Enforces modular file structures while maintaining sensible grouping and token efficiency.
---

# Clean Architecture & Pragmatic Modularity

When writing or refactoring code, follow these structural rules to balance modularity with readability and **AI token efficiency**. Avoid both massive files and over-fragmentation.

## 1. Feature Separation (Token Limits)
* Major components, classes, and complex core logic must have their own dedicated files.
* **Size Limit:** Keep files under ~200-300 lines. Extremely large files consume too many tokens for an AI to efficiently read, edit, and reason about.
* If a file exceeds this limit or handles multiple distinct domain concepts, refactor it by extracting logic into smaller files.

## 2. Cohesion (Context Locality & Token Savings)
* **Do NOT over-fragment:** Every new file an agent must read requires separate tool calls and context loading. Do not create a separate file for every tiny function.
* **Keep helpers localized:** If a helper function is only ever used by one main function, keep it in the *exact same file* as a local function. This ensures the AI gets the full context in a single file read.
* Group small, genuinely shared utility functions into focused helper modules (e.g., `stringUtils.js` or `mathHelpers.js`).

## 3. Function-Level Rules
* Aim for single-purpose functions. If a function is doing too much (e.g., fetching data AND formatting it AND updating the UI), break it down into smaller functions *within the same file* or module.
* Define clear, minimal exports at the bottom or top of the file so the public API of the module is immediately obvious without requiring a full read.
