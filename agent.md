# Skyfall Agent Brief

## Project Goal

Build a soft-casual browser runner game. A ball moves automatically along a straight infinite path while the player steers left and right to avoid obstacles. The
game shows progress as a percentage above the play area and starts from a
level list.

## Editable Project Decisions

- **Initial level:** one Level 1 run, with a 1,000 m target designed to last
  about 60 seconds when completed successfully.
- **Controls:** Left and Right arrow keys steer the ball.
- **Path:** the safe corridor; leaving it ends the run.
- **Obstacles:** use static blockers in the initial level. Hitting one ends
  the run.
- **Run outcome:** show a game-over overlay with retry and level-list actions.
  Completing the target reaches 100% and shows a completion state.
- **Progress:** save level completion and best results locally in the browser.
- Restart button

## Current status
The game area is visible on the page. Cube obstacles have been implemented. Depth and 3d visual effects have been implemented. Play and restart options. 

## Decisions made along the way
- For levels, position of obstacles is determined manually. 
- Levels have limit.
- Progress percentage will be calcualted for levels only. 
- High score of each level will be specific to that level.
- The End will appear at each level's limit. Same format for every level. 
- Free Play mixes cube events and spike events equally. Spikes are square
  pyramids with bases half as wide as cubes; each spike event has one pair in
  a lane or, 50% of the time, two pairs across two lanes. Level 1 remains
  cube-only.
- All levels are available from the level list regardless of previous scores
  or completion; completion still records progress and high scores locally.
- Level 2 is a 50 m, no-curves level available from the level list. It uses an
  authored obstacle event every 6 m: four spikes in left and
  centre, four spikes in right and centre, cubes in right/centre/left/centre/
  right lanes, then four spikes in left and right lanes.

## Current Exclusions

- Touch controls
- Audio
- Accounts or online leaderboards

## Working Rules

- Preserve user edits and avoid unrelated changes.
- Keep future levels configuration-driven instead of duplicating game-loop
  logic.
- Maintain responsive layouts and keyboard-accessible UI.
- Test controls, collisions, percentage progress, retry, completion, and local
  progress saving after gameplay changes.
- Keep this file current when project decisions change; it is intentionally
  plain Markdown and easy to edit.
- Do not change anything in Level 1, 2, 3, and 4 unless directly prompted.
