# Corpus study — figures to confirm against the run log

`src/content/case-studies/transformer-italian-corpus.mdx` is published and the
registry contract forbids placeholders in a published body, so the figures are
already written in. They are quoted "from the run log" but have not been
re-verified against it by anyone reviewing this repo. Before the launch is
announced, check each line against the real run output and edit the MDX in place.

| Figure in the study                               | Where                    | Confirm against              |
| ------------------------------------------------- | ------------------------ | ---------------------------- |
| Total tokens: 127.4M (post-deduplication)         | Stage 1, "Run specifics" | `corpus.it.pq` dedupe report |
| MinHash threshold 0.85 Jaccard, paragraph level   | Stage 1, "Run specifics" | data-prep config             |
| Vocabulary 32,000, byte-level BPE                 | Stage 2                  | `tokenizer.json`             |
| 6 layers, 8 heads, 512 dim, 1024 context          | Stage 3                  | `config.yaml`                |
| Warmup 500 steps, clip 1.0, checkpoint every 1000 | Stage 3                  | `config.yaml`                |
| Held-out perplexity 18.7 (English-tokenizer 32.4) | Result / Reflection      | `report.json`                |
| Compression ratio 3.82x vs English-trained BPE    | Result / Reflection      | `report.json`                |
| Parameter count 11.3M                             | Result / Reflection      | model summary                |

Also decide whether to say how the 3.82x ratio is measured (bytes per token or
the inverse), since the Stage 2 snippet defines compression as `encoded/bytes`
(smaller is better) while the result reads as a multiplier.

The page stays a "professional draft" in the roadmap until this table is signed
off. No code change is needed for any of it.
