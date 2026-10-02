# WISE² Agent Handoff — TEMPLATE

> Copy this into `/opt/wise2/agents/handoffs/<UTC-timestamp>-<slug>.md` when
> handing work between Claude, Codex, Hermes, or a human. Keep it factual and
> self-contained: the next agent should be able to continue from this alone.
> **No secrets.**

```
HANDOFF
=======
From agent:      <Claude Opus 4.8 | Codex | Hermes | human>
To:              <agent/human or "next session">
UTC timestamp:   <YYYY-MM-DDThh:mm:ssZ>
Related context: <files in /opt/wise2/context touched or relevant>

TASK
----
<one-line statement of the task>

GOAL
----
<the desired end state / definition of done>

CURRENT STATE
-------------
<what is true right now; what works, what doesn't>

FILES CHANGED
-------------
<path — what changed — reversible? (backup location if any)>

COMMANDS EXECUTED
-----------------
<notable commands run; omit anything containing secrets>

TESTS
-----
<what was tested and the result; PASS/FAIL>

OPEN PROBLEMS
-------------
<known issues, blockers, things to verify>

NEXT ACTION
-----------
<the single most useful next step>

ROLLBACK
--------
<how to undo the changes in this handoff; backup paths; git refs>

PAUSE/APPROVAL NEEDED
---------------------
<any item requiring Daniel: auth, secret, sudo, push, ACL, scan authorization>
```
