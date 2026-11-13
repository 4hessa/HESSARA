---
layout: ../../layouts/Prose.astro
section: insights
kicker: Field Report
title: "Grounding answers in evidence: what citation-first reasoning looks like"
sub: Tracing each claim in a recommendation back to the document it came from
description: A practical look at citation-first reasoning, where every claim in an AI-assisted recommendation can be traced to its source.
---

Most disappointing AI answers share one fault: they sound right and cannot be checked. Citation-first reasoning reverses the usual order. The system finds the evidence first, and is only then allowed to make a claim that the evidence supports.

## The difference in practice

A conventional answer is written and then decorated with references. A citation-first answer is assembled from passages that were retrieved before a word of the answer existed. The practical test is simple: pick any sentence in the answer and ask where it came from. If the reply is a specific passage in a specific document, the answer is grounded. If the reply is "the model knows this", it is not.

## What a grounded answer contains

- **Claims tied to passages,** not to whole documents. "See the annual report" is not a citation.
- **Visible gaps.** Where the sources are silent, the answer says so instead of filling the space.
- **Conflicts shown, not resolved in secret.** When two sources disagree, the reader sees both.
- **A clear line between evidence and inference.** What the sources say and what the system concluded from them are labelled differently.

## What grounding does not do

Grounding reduces a particular failure: statements with no basis. It does not make an answer correct. A model can quote a passage accurately and still draw the wrong conclusion from it, cite a source that is itself mistaken, or miss the one document that mattered because it was never retrieved.

For that reason, no honest system should promise that errors are impossible. What it can promise is that every claim is open to inspection, which turns checking from guesswork into a short, bounded task.

## How to review a grounded answer

1. **Sample the citations.** Open three at random and confirm the passage says what the answer claims.
2. **Look for what is missing.** Ask which document you expected to see and did not.
3. **Read the inferences separately.** These are where judgment entered, and where yours is needed.
4. **Check the dates.** A well-cited answer built on last year's figures is still out of date.

## What to take away

Citation-first reasoning does not remove the need for review. It makes review possible in minutes instead of hours, and it makes the limits of an answer visible to the person who has to rely on it.
