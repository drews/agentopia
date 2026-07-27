# Tasks: Make the Bridge Scene-First

## 1. Shell inversion & purge

- [ ] 1.1 Make the Pixi scene the root view: remove the five-tab nav; App renders scene + overlay host + attention HUD dock; delete THEATER route
- [ ] 1.2 Purge fabricated data: remove CommanderDashboard's mock fleet/mission/performance content and AccessView's mock efficiency numbers; keep only real-signal tiles for reuse in the ops overlay
- [ ] 1.3 Verify: app boots into the scene full-bleed; no tab bar; screenshot

## 2. Activity choreography (backend + scene)

- [ ] 2.1 Backend: broadcast `agent_activity` (thinking/responding/idle) from llm_service call start/finish and `tool_activity` (tool, server, ok/fail) from registry call_tool
- [ ] 2.2 Scene: map events → animations (thought/speech glyphs, console pulses, fail blink); chat_message → fading speech bubble
- [ ] 2.3 Verify: hail an agent via chat while watching the scene — thinking glyph appears, speech bubble on reply; call an MCP tool — its console pulses; screenshot/recording

## 3. Pixel-art scene

- [ ] 3.1 Ship interior tilemap (4–6 rooms mapped to existing station grid; consoles per MCP namespace) in the Pixi stage
- [ ] 3.2 Character spritesheets (adapt ai-town MIT assets, recolor per agent): 4-dir walk + idle frames; wire into interpolated movement
- [ ] 3.3 Verify: agents visibly walk room-to-room with correct facing; idle animations at stations; screenshot

## 4. Overlays

- [ ] 4.1 Overlay host: one modal layer, scene dims + keeps ticking, Esc/scene-click closes; overlay state in zustand
- [ ] 4.2 Agent dossier: click agent → persona card + live activity + chat (mined from ManifestView); verify chat round-trip from within dossier
- [ ] 4.3 Ops console overlay: click a console → real WS/MCP/LLM status + activity log ring buffer (mined from AccessView real tiles); verify against /api/mcp/status truth
- [ ] 4.4 Showcase kept behind dev affordance (long-press ship name plate); delete now-empty tab view files
- [ ] 4.5 Verify: every overlay opens from the scene and Esc returns; no route/tab navigation anywhere; screenshots

## 5. Attention HUD

- [ ] 5.1 Bottom ribbon: Now (user-set focus), Next (real calendar via eventkit when host server up, hidden otherwise), breadcrumb (last interaction + age)
- [ ] 5.2 One-click summon of the responsible agent's dossier from the breadcrumb
- [ ] 5.3 Verify: with EventKit running, Next shows a real upcoming event; without, ribbon degrades gracefully; screenshot

## 6. Character creation (first-boarding hook)

- [ ] 6.1 First-run detection (no saved player profile in localStorage) boots into a character creation overlay before the scene: name/callsign, avatar customization (palette swap + a few sprite options over the player spritesheet), and 2–3 warm EF-preference prompts (e.g. "when should the crew nudge you?", "morning briefing: yes/no") — creation doubles as preference capture that feeds crew behavior
- [ ] 6.2 Persist profile (localStorage first pass); scene greets the new captain by callsign; profile editable later via the dossier overlay on the player avatar
- [ ] 6.3 Verify: fresh-profile boot shows creation, choices visibly reflected in-scene (sprite + greeting), returning boot skips straight to the scene
