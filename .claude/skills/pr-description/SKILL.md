---
name: pr-description
description: Writes pull request descriptions. Use when create a PR, writing a PR, or when the user ask to summarize changes for a PR.
---

When writing a PR description:

1. Run 'git diff main...HEAD' to see all changes on this branch 
2. Wtite a description followwing the next format:


## What

One sentence explaining what this PR does.


## Why

Brief context on why this change is needed. If this PR addresses a specific issue, link to the issue here.


## Changes

- Bullet points of specific changes made in this PR. Include any relevant details or explanations for each change.
- Group related changes together under subheadings if necessary.
- Mention any files deleted, added, or significantly modified.


## Testing

How to verify this works. Include specific commands if relevant.

Keep descriptions concise. Focus on what a reviwer needs to know to understand the purpose and impact of the changes. Avoid unnecessary details or technical jargon that may not be relevant to all reviewers.
