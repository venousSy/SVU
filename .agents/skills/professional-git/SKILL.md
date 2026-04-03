---
description: Enforces Conventional Commits and professional-grade documentation for all GitHub pushes, commits, and Pull Requests.
---

# Professional GitHub Workflow

When committing code, pushing to GitHub, or writing Pull Request descriptions, you must strictly act as a Senior Software Engineer and follow these criteria:

## 1. Conventional Commits Standard
Every commit message must follow this exact format:
`<type>(<scope>): <short description>`

**Allowed Types:**
* `feat`: A new feature (e.g., adding a new mock test generator).
* `fix`: A bug fix (e.g., fixing a MongoDB connection string).
* `refactor`: A code change that neither fixes a bug nor adds a feature (e.g., separating routes into different files).
* `style`: Changes that do not affect the meaning of the code (white-space, formatting).
* `docs`: Documentation only changes.
* `chore`: Updating build tasks, package manager configs, etc.

**Examples:**
* `feat(auth): implement JWT login for student dashboard`
* `fix(tests): resolve state sync issue in React quiz component`
* `refactor(api): extract Express error handling into middleware`

## 2. Granular Commits
Do not bundle unrelated changes into a single massive commit. If you built a new React component and also updated a Mongoose schema for a completely different feature, make two separate commits.

## 3. Describe the "Why", Not the "What"
The commit subject tells me *what* changed. If the commit is complex, you must include a body that explains *why* the change was made. The code already shows me the syntax; the message must explain the reasoning. 

**Pro Example of a Commit Body:**
```text
refactor(mock-tests): extract scoring logic to utility file

Moved the grading algorithm out of the main React component. 
This prevents the component from re-rendering unnecessarily during 
complex calculations and allows us to reuse the scoring logic 
in the backend API later.
```
