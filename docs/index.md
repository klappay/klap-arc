---
layout: home

hero:
  name: klap-arc
  text: 0xSplits on Circle Arc, today
  tagline: A temporary, open-source, self-hosted deployment of 0xSplits' own contracts on Arc — built to be deleted the day 0xSplits ships official support.
  image:
    src: /logo.png
    alt: klap-arc
  actions:
    - theme: brand
      text: Research
      link: /research
    - theme: alt
      text: GitHub
      link: https://github.com/klappay/klap-arc

features:
  - title: Meant to be replaced
    details: Not a product — a stopgap. The moment 0xSplits ships official Arc support, this project's contracts are retired in favor of @0xsplits/splits-sdk. See the migration plan.
    link: /migration
  - title: 100% open source
    details: GPL-3.0 contracts, MIT SDK. Every line of Solidity here is either an unmodified fork of 0xSplits' own audited splits-v2, or plainly original deploy/client code.
    link: /contracts
  - title: Reuses 0xSplits wherever possible
    details: For security, not convenience — no custom split logic was written. The contracts are vendored verbatim from a pinned, real upstream commit, never hand-copied.
    link: /research
  - title: Lazy, counterfactual addressing
    details: Split addresses are predicted off-chain before anything is deployed — the same non-custodial pattern klap-core already uses with 0xSplits elsewhere.
    link: /sdk
---
