---
layout: ../../layouts/Prose.astro
section: insights
kicker: Research Note
title: Choosing between a general model and a domain-tuned one
sub: Matching the model to the question, the stakes, and the data at hand
description: A short framework for deciding when a general-purpose language model is enough and when a domain-tuned model is worth the effort.
---

The choice between a general model and a domain-tuned one is often presented as a contest. It is better treated as a matching problem: what does this question need, what does a mistake cost, and what evidence is available to work from?

## Three questions to ask

### How specialised is the language?

General models handle everyday business reasoning well. They become less reliable where terms carry a precise meaning that differs from ordinary use, as in regulation, clinical practice, or financial instruments. The more a field's vocabulary departs from common usage, the stronger the case for tuning or for supplying the definitions directly.

### What does an error cost?

For a first draft that a person will rewrite, breadth and speed matter most. For an output that feeds a decision with legal or financial weight, consistency matters more than fluency, and a narrower model with predictable behaviour is easier to trust and to audit.

### Where does the knowledge live?

If the answer depends on your own documents, the deciding factor is usually retrieval, not the model. A general model given the right passages will often outperform a specialised model given none. Tuning helps most with style, format, and judgement that cannot be supplied as a document.

## A simple guide

| Situation | Usually sufficient |
| --- | --- |
| Broad reasoning, varied topics, low cost of error | A general model |
| Answers must come from your own material | A general model with strong retrieval |
| Specialised vocabulary and fixed output formats | A domain-tuned model |
| High stakes and a need for consistent behaviour | A domain-tuned model with human review |

## Common mistakes

- **Tuning to fix a retrieval problem.** If the model lacks the facts, teaching it a style will not help.
- **Judging on a handful of examples.** Build a small test set from real questions and score both options on it.
- **Ignoring maintenance.** A tuned model must be re-evaluated whenever the underlying model or your data changes.

## What to take away

Start with a general model and good retrieval. Move to a domain-tuned model when you can point to a measured gap on your own test questions, and keep that test set so the decision can be revisited.
