# Product

## Register

brand

## Users

Due pubblici, pari priorità — il sito deve parlare a entrambi senza perderne nessuno.

1. **PMI lombarde** — piccole e medie imprese italiane che sentono di dover automatizzare ma non sanno da dove iniziare. Decisori spesso non tecnici. Hanno bisogno di vicinanza, casi concreti, ROI tangibile e zero attrito cognitivo. Vogliono fidarsi prima di capire ogni dettaglio tecnico.
2. **Grandi aziende** — decisori tecnici e figure C-level. Cercano rigore, scala, affidabilità e prove di competenza reale prima di impegnarsi.

**Contesto d'uso**: stanno valutando un partner digitale per crescere, spesso scettici verso l'hype e disorientati dalla quantità di strumenti e consigli. **Job-to-be-done**: capire se SarconX può aiutarli concretamente a capire da dove partire e decidere se richiedere una consulenza (gratuita). La conversione primaria del sito è la richiesta di consulenza.

## Product Purpose

SarconX è uno studio di consulenza digitale e growth con sede a Pavia e Milano (Lombardia) che aiuta le imprese italiane a costruire crescita concreta: strategia, siti web, e-commerce, app e software operativo, marketing e servizi done-for-you. Sei aree di intervento (consulenza strategica, marketing & growth, siti web, e-commerce, app e software, servizi done-for-you) che partono sempre dal obiettivo di business, non dalla tecnologia.

Il sito esiste per **convertire imprese italiane scettiche in lead qualificati per una consulenza**, dimostrando competenza concreta — non astrazioni, non hype. Nasce dall'esperienza industriale e manageriale reale dei fondatori ("Roots in Industry"). Successo = un visitatore richiede una consulenza convinto che SarconX produca un cambiamento misurabile.

## Brand Personality

**Voce: vicina e consulenziale** — un consulente di fiducia che ti accompagna, non una macchina fredda e non un venditore di hype. Calda, chiara, pedagogica.

Tre parole: **affidabile, chiaro, concreto.**

L'autorità si guadagna attraverso l'esperienza operativa e industriale vissuta ("Roots in Industry"), non attraverso buzzword o estetica futuristica. Obiettivo emotivo: il visitatore si sente **capito e rassicurato** ("loro capiscono la mia azienda e mi guideranno"), non abbagliato né messo sotto pressione.

> Nota di tensione progettuale: la prima versione del sito aveva un'estetica fredda e terminal-native (glow neon su nero, monospace ovunque, `sarconx-agent-v3.2.running`) che **contraddiceva** la personalità desiderata. Il redesign (2026) ha spostato il sito da "macchina intelligente" a "partner umano competente" con un palette caldo soft/cream + accento terracotta, senza perdere il rigore tecnico.

## Anti-references

- **Hype da guru dell'AI (anti-referenza primaria).** Promesse vuote tipo "10x il tuo business", claim gonfiati senza sostanza, rumore da influencer LinkedIn. SarconX vende ingegneria e risultati misurabili, mai hype. Se una frase potrebbe apparire sulla landing di un guru AI, va riscritta.
- **Il template SaaS clonato (derivata dall'obiettivo di de-hype-ificazione).** Inter per tutto, gradienti viola→blu, gradient text, glow neon su sfondo scuro — già rimossi nel redesign 2026, da evitare in futuro perché tirerebbero il brand verso "generico tool AI" invece di "partner umano e affidabile guidato da persone reali".

## Design Principles

1. **Concretezza sull'astrazione** — "non parliamo di astrazioni". Ogni affermazione sostenuta da un numero, un caso, un meccanismo reale. Mostra il lavoro, non lo raccontare e basta.
2. **Calore con rigore** — caldi e umani nella voce, rigorosi e precisi nella sostanza. L'equilibrio del consulente di fiducia: accessibile ma credibile.
3. **Roots in Industry** — l'autorità viene dall'esperienza operativa reale, non dal sembrare futuristici. Guidare con la competenza guadagnata, non con le promesse.
4. **Parla a due senza perderne nessuno** — gerarchia chiara che serve sia la PMI non tecnica (chiarezza in superficie) sia il decisore enterprise (profondità un livello sotto).
5. **Sostanza, mai hype** — il test anti-slop applicato al copy: niente che suoni da guru.

## Accessibility & Inclusion

**WCAG 2.1 AA** su tutto il sito:
- Contrasto testo corpo ≥ 4.5:1, testo grande ≥ 3:1 — punto critico vista l'estetica scura attuale.
- Navigazione completa da tastiera con focus visibile.
- Struttura semantica corretta: gerarchia heading, landmark, ruoli ARIA dove servono.
- Form con label corrette e messaggi d'errore chiari (form di contatto + `send-email.php`).
- Alternative `prefers-reduced-motion` per ogni animazione.

Cura extra per gli utenti PMI non tecnici: massima chiarezza, carico cognitivo minimo, linguaggio semplice. Sito in lingua italiana.
