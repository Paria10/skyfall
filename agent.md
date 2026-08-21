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
- Level 2 is a 50 m, no-curves level unlocked only after Level 1 reaches
  100%. It uses an authored obstacle event every 6 m: four spikes in left and
  centre, four spikes in right and centre, cubes in right/centre/left/centre/
  right lanes, then four spikes in left and right lanes.
- Level 3 is a 50 m level unlocked only after Level 2 reaches 100%. It uses
  authored events every 4 m from 4–48 m: cubes right/centre, four spikes left
  and centre, cubes centre/left, four spikes right and centre, four spikes
  left and right, two spikes centre, two spikes right, then cubes centre/right/
  centre. From 10 m, curve right for 4 m, then left for 4 m, right for 4 m,
  and return to centre over 4 m.
- Level 4 is a 100 m level unlocked only after Level 3 reaches 100%. It uses
  authored events every 4 m through 96 m, repeating this sequence as needed:
  four spikes right/centre, four spikes left/centre, a right laser, cubes
  centre/left/centre, four spikes right/centre, lasers right/left, a centre
  cube, four spikes left/right, a left cube, a centre laser, then two spikes
  right and two spikes left. It starts at 1.2× normal speed and curves right
  from 10–14 m, left from 14–18 m, then returns to centre over 18–22 m.
- Spacebar starts one fixed, single jump while a run is active. Any airborne
  part of the arc clears spikes, but cubes and leaving the path remain fatal.
- On touch devices, dragging across the gameplay field steers the ball left
  and right; tapping the field during an active run starts the same single jump.
- Free Play selects regular cubes, laser cubes, and spike groups equally.
  Laser cubes use the regular cube palette, have one centred front emitter,
  and fire a neon-red beam from it for one second every two seconds after
  entering view. Active beams are fatal, follow their lane through curves,
  and cannot be jumped.

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
- Do not change anything in Level 1 unless directly prompted.
