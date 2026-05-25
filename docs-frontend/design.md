# Quản lý dự án Kanban - Design Guidelines

## Mission
Create implementation-ready, token-driven UI guidance for Quản lý dự án Kanban that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- **Product/brand**: Quản lý dự án Kanban
- **URL**: [Atlassian Jira Board](https://tranquocdam2792004-1760605164764.atlassian.net/jira/software/projects/QLDK/boards/34)
- **Audience**: authenticated users and operators
- **Product surface**: marketing site

## Style Foundations
- **Visual style**: clean, functional, implementation-oriented
- **Main font style**: 
  - `font.family.primary=Atlassian Sans`
  - `font.family.stack=Atlassian Sans, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Ubuntu, Helvetica Neue, sans-serif`
  - `font.size.base=14px`
  - `font.weight.base=400`
  - `font.lineHeight.base=20px`
- **Typography scale**: 
  - `font.size.xs=12px`
  - `font.size.sm=13.33px`
  - `font.size.md=14px`
  - `font.size.lg=16px`
  - `font.size.xl=20px`
- **Color palette**: 
  - `color.text.primary=#292a2e`
  - `color.text.secondary=#505258`
  - `color.text.tertiary=#1868db`
  - `color.text.inverse=#6b6e76`
  - `color.surface.base=#000000`
  - `color.surface.muted=#ffffff`
- **Spacing scale**: 
  - `space.1=1px`
  - `space.2=2px`
  - `space.3=3px`
  - `space.4=4px`
  - `space.5=6px`
  - `space.6=8px`
  - `space.7=10px`
  - `space.8=12px`
- **Radius/shadow/motion tokens**: 
  - `radius.xs=3px`
  - `radius.sm=4px`
  - `radius.md=6px`
  - `radius.lg=8px`
  - `radius.xl=10px`
  - `radius.2xl=24px`
  - `radius.step7=9999px`
  - `shadow.1=rgba(30, 31, 33, 0.15) 0px 8px 12px 0px, rgba(30, 31, 33, 0.31) 0px 0px 1px 0px`
  - `motion.duration.instant=100ms`
  - `motion.duration.fast=200ms`
  - `motion.duration.normal=800ms`

## Accessibility
- **Target**: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: buttons (77), links (27), inputs (6), navigation (6), lists (6).
- *Extraction diagnostics*: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
