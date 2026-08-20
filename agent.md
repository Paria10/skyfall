# Skyfall Agent Brief

## Project Goal

Build a soft-casual browser runner game. A ball moves automatically along a
straight path while the player steers left and right to avoid obstacles. The
game shows elapsed seconds above the play area and starts from a level list.

## Editable Project Decisions

- **Initial level:** one Level 1 run, with a 1,000 m target designed to last
  about 60 seconds when completed successfully.
- **Controls:** Left and Right arrow keys steer the ball.
- **Run controls:** Play starts a three-second countdown, then becomes Pause.
  Restart resets the run to its ready state; it never starts a run automatically.
- **Path:** use a straight safe corridor; leaving it ends the run.
- **Obstacles:** use static blockers in the initial level. Hitting one ends
  the run.
- **Run outcome:** show a game-over overlay with retry and level-list actions.
  Completing the target reaches 100% and shows a completion state.
- **Counter:** show metres at the top right of the game screen. One metre
  equals the distance between horizontal path lines.
- **High score:** show and locally save the best metres score; update it as
  soon as the player passes it. New-record game-over screens show confetti and
  use the label "NEW High score".
- **Speed:** increase path and obstacle speed by 1.2× every five seconds.
- **Progress:** save level completion and best results locally in the browser.

## Current Exclusions

- Additional levels and themes
- Touch controls
- Audio
- Accounts or online leaderboards

## Working Rules

- Preserve user edits and avoid unrelated changes.
- Keep future levels configuration-driven instead of duplicating game-loop
  logic.
- Maintain responsive layouts and keyboard-accessible UI.
- Test controls, collisions, elapsed-time display, retry, completion, and local
  progress saving after gameplay changes.
- Keep this file current when project decisions change; it is intentionally
  plain Markdown and easy to edit.
