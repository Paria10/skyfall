# Skyfall Agent Brief

## Project Goal

Build a soft-casual browser runner game. A ball moves automatically along a
path that can curve while the player steers left and right to avoid obstacles. The
game shows run progress above the play area and starts from a game list.

## Editable Project Decisions

- **Controls:** Left and Right arrow keys steer the ball.
- **Run controls:** Play starts a three-second countdown, then becomes Pause.
  Restart resets the run to its ready state; it never starts a run automatically.
- **Game list:** a circular menu button opens the game list. Its first option,
  Free Play, opens the current game design in its ready state. Show the
  selected option at the top centre of the page.
- **Path:** use a moving safe corridor with randomly spaced curves. Each curve
  randomly bends left or right at a random intensity, then returns to centre.
  Keep the ball constrained to that corridor.
- **Obstacles:** use static blockers in the initial level. Hitting one ends
  the run.
- **Run outcome:** show a result overlay after a collision or a completed
  level. A completed target reaches 100% and shows a completion state.
- **Counter:** show metres at the top right of the game screen. One metre
  equals the distance between horizontal path lines.
- **High score:** show and locally save the best metres score; update it as
  soon as the player passes it. Keep a separate high score for Free Play and
  each level. New-record game-over screens show confetti and use the label
  "NEW High score".
- **Speed:** increase path and obstacle speed by 1.2× every five seconds.
- **Progress:** save level completion and best results locally in the browser.

## Level 1 Rules

- **Selection:** Level 1 is selected from the circular game list; display
  `Level 1` at the top centre when active. Free Play remains a separate,
  unlimited mode with randomized curves and obstacles.
- **Course:** use a straight, non-curving path for the entire 50 m run.
- **Distance UI:** show metres and a percentage tracker at the top right. In
  Level 1, make the metre counter slightly smaller and place the percentage
  directly below it; it reaches 100% at 50 m. One metre equals one horizontal
  path-line spacing.
- **Obstacle schedule:** use static cube blockers at 6, 12, 18, 24, 30, 36,
  42, and 48 m. Their lane order is centre, left, left, right, left, right,
  right, centre. Do not use random obstacle positions in this level.
- **Collision:** end the run only when the ball overlaps a cube in both lane
  width and forward depth, or when more than half of the ball leaves the yellow
  path. Cube shadows are visual-only and never collide.
- **Finish:** draw a huge all-caps `THE END` marker on the path at 50 m. If the
  player reaches 50 m without a cube collision, stop the run and show
  `LEVEL 1 COMPLETE`.
- **Scores:** store a Level 1 high score separately from Free Play. Update it
  as soon as the current Level 1 run exceeds it; a new record uses the `NEW
  High score` label and confetti on the result overlay.
- **Unlock:** on the first 100% completion, persist the Level 1 completion
  flag. Thereafter, every Level 1 result overlay includes a disabled `Next
  level` button below `Play again`; keep it disabled until Level 2 exists.

## Current Exclusions

- Additional levels and themes beyond Level 1
- Touch controls
- Audio
- Accounts or online leaderboards

## Working Rules

- Preserve user edits and avoid unrelated changes.
- Keep future levels configuration-driven instead of duplicating game-loop
  logic.
- Maintain responsive layouts and keyboard-accessible UI.
- Test controls, collisions, metre/percentage displays, retry, completion, and
  local progress saving after gameplay changes.
- Keep this file current when project decisions change; it is intentionally
  plain Markdown and easy to edit.
