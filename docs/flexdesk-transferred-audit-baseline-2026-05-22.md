# FlexDesk-Transferred Verge Five Audit Baseline

Date transferred: 2026-05-22

This document preserves the audit that was originally discussed in the FlexDesk Revamp chat and moved into the Verge Five business-credit platform project. It is the active remediation baseline alongside `UX_CONTENT_REMEDIATION_PLAN.md`.

## Scores

- UX score: 7 / 10
- Content clarity score: 6.5 / 10
- Onboarding score: 7 / 10
- Educational flow score: 7.5 / 10

## Main Diagnosis

The platform has a strong structure: Start Here, Dashboard, 8-module roadmap, lesson pages, vendor directories, report pages, account pages. The biggest issue is repeated generic wording, unclear terms, duplicate legacy URLs, and CTAs that do not always tell beginners exactly what to do next.

## Critical / High Priority Items

1. Fix broken final summary encoding: `Ã¢Å“â€œ`.
2. Redirect ugly legacy URLs:
   - `/newpage87229491/` -> `/website-domain-email/`
   - `/newpage7c157847/` -> `/llc-vs-corporation/`
   - `/newpagea5b34995/` -> `/business-credit-criteria/`
   - `/newpagebd8ae2e6/` -> `/high-tech-auto-vendors/`
   - `/newpageed554e37/` -> `/business-assets-equipment/`
3. Replace repeated generic lesson body copy:
   - Current: `Business credit approvals are built from signals. This lesson helps the member create one of those signals correctly...`
   - Direction: use lesson-specific plain-English guidance.
4. Define advanced terms before users act on them:
   - NAP, EIN, DUNS, tradeline, Net 30, bank rating, Low 5, comparable credit, business bureaus, personal guarantee.
5. Clarify checklist progress storage.
6. Add proof examples to every lesson.
7. Add stronger warnings before vendors, cards, and funding.
8. Make account/trial/full-access states clearer.
9. Add current-step progress on dashboard.
10. Clean up final report polish because the report page affects trust most.

## Recommended Staged Plan

### Stage 1 - Foundation Cleanup

- Fix final summary encoding.
- Clean legacy URLs.
- Update header CTA from `Continue` to `Continue Buildout`.
- Standardize module CTA labels.

### Stage 2 - Lesson Template Improvements

- Replace generic lesson intros.
- Add proof examples.
- Add `What you completed / Why it matters / What happens next`.
- Clarify browser-saved vs account-saved progress.

### Stage 3 - Glossary and Beginner Clarity

- Add simple definitions/tooltips for key business-credit terms.

### Stage 4 - Page-Specific Fixes

- Start Here
- Dashboard
- Bank Rating
- Vendor pages
- Credit Cards
- Final Summary
- Account/Login/Membership

### Stage 5 - QA

- Click every CTA.
- Check page flow.
- Confirm each module transitions correctly.
- Verify no duplicate confusing wording remains.

## Working Rule

Fix by shared system layer first, then page-specific content. Do not make one giant blind edit.

