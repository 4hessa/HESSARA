---
layout: ../../layouts/Prose.astro
section: resources
kicker: Reference
title: Model registry and capability overview
sub: What each HESSARA model is tuned for and how to choose between them
description: An overview of the HESSARA language models, what each is intended for, and guidance on choosing between them.
draft: This overview describes the intended role of each model. Technical specifications, limits, and benchmark results will be added as they are confirmed.
---

The HESSARA model ecosystem is organised around three specialised models, described on the [Language Models](/models/) page. This reference explains what each is meant for and how to choose.

## The three models

### Cognitive Reasoning LLM

Intended for open-ended analysis: weighing arguments, comparing options, and explaining a line of reasoning step by step. Choose it when the question is qualitative and the value lies in the quality of the argument.

### Quantitative & Market LLM

Intended for questions that turn on figures: trends, comparisons, sensitivity to assumptions, and market context. Choose it when the answer must be consistent with numbers you supply.

### Sovereign Enterprise LLM

Intended for organisations with strict requirements on where data is processed and who controls it. Choose it when governance and deployment control matter as much as capability.

## Choosing a model

| If your question is mainly about | Start with |
| --- | --- |
| Strategy, argument, and trade-offs | Cognitive Reasoning LLM |
| Figures, forecasts, and market context | Quantitative & Market LLM |
| Regulated data and controlled deployment | Sovereign Enterprise LLM |

When a question spans more than one area, routing can direct each part to the most suitable model. The [general versus domain-tuned](/insights/general-vs-domain-models/) note gives a broader framework for this choice.

## Capabilities

The Language Models page lists three platform capabilities:

- **Context windows** for working across long documents
- **Citation grounding,** so that claims can be traced to sources
- **Latency optimisation and routing,** so that each request reaches a suitable model

Grounding makes answers checkable. It does not make them infallible, and outputs that inform important decisions should be reviewed by a person. See [citation-first reasoning](/insights/citation-first-reasoning/).

## Evaluating a model for your use

1. Collect twenty to fifty real questions from your own work.
2. Write down what a good answer to each would contain.
3. Run each candidate model on the set and score the results.
4. Keep the set, and re-run it whenever a model or your data changes.

## Related

- [Getting started with your first advisory session](/resources/getting-started/)
- [Security, privacy, and data handling](/resources/security/)
