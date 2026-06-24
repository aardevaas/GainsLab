# Section: Education

> Covers: Education hub (science-backed articles).

## Job
Make the user smarter and more confident — replacing fitness misinformation
with cited, trustworthy guidance, and building authority/trust in the brand.

## Today (live in code)
- **`/learn`** — article hub: category filters (Nutrition, Training, Recovery,
  Body Composition, Myths), search, article cards.
- **`/learn/[slug]`** — article detail: key takeaways, sectioned body, cited
  references.
- 8 articles seeded (protein, progressive overload, sleep, cutting, HIIT vs
  cardio, spot-reduction myth, creatine, nutrient timing) — static data in
  `src/lib/learn/articles.ts`.

## Target  *(synthesized — react/adjust)*

Education is **both an acquisition channel and the trust spine** of the
"science-backed" positioning — and crucially, **contextual, not a static library.**

- **Contextual delivery is the edge.** Generic article libraries are everywhere and
  ignored. GainsLab surfaces the *right* lesson tied to the user's data/goal:
  "you're cutting and under protein 3 days running — here's why that costs muscle."
  This is the Education ↔ Gains Score `topLever` ↔ AI-layer bridge.
- **Dual role:** **public** evergreen articles = SEO/organic acquisition (free,
  indexable, shareable by creators); **contextual in-app guidance** = retention.
  Both, not either/or.
- **Creators are content authors too** — creators can publish educational content to
  their communities (ties to the creator economy; their voice = their trust).
- **Format:** text + citations now (cheap, trustworthy, SEO-friendly); video/
  interactive later. Trust is earned fastest by **visible citations + honesty**
  (same principle as the Supplements evidence grades).

## Information & hierarchy
- **In-app:** contextual cards surfaced by goal + Gains Score weak pillar ("your
  recovery score is low — read this"). Not a wall of articles.
- **Public hub:** browsable/searchable evergreen library by category, SEO-structured.

## Connections
- **Gains Score / AI** — the weak pillar (`topLever`) decides what to teach next.
- **All sections** — contextualizes every feature ("why this macro split / rep range").
- **Creators** — creators author + publish educational content to their audiences.
- **SEO / GTM** — public articles = an organic acquisition channel (free).
- **Supplements** — shares the evidence-grade trust model.

## Open questions  *(resolved; nothing blocking)*
- Content volume/authorship cadence is an ops decision, not an architecture one —
  the model supports first-party + creator-authored from day one.
