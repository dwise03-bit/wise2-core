# Architecture

shared/grid.mjs owns blast rays, chain reactions and BFS without rendering dependencies. shared/round.mjs owns injectable configuration, timers, movement, pickups/upgrades, enemy pursuit/evasion, damage, score and round reset. phaser/prototype-lab supplies a zero-dependency Canvas renderer; it is the future Phaser lab, not an installed Phaser engine.

Godot, Luau and JavaScript ports stay separate. Share data and behavioral fixtures, not a universal engine abstraction. Blasts in one chain see the same original obstacle layout. Enemy escape uses conservative predicted danger and shortest paths; it is not a full time-expanded escape planner.
