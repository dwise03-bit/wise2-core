-- WISE² REAPER bridge adapter. Install via REAPER > Actions > Show action list > Load ReaScript.
-- The local bridge should invoke these predefined actions; never execute arbitrary script text from Discord.
local function state()
  local _, project = reaper.EnumProjects(-1, '')
  local _, path = reaper.EnumProjects(-1, '')
  local position = reaper.GetPlayPosition()
  return { project = project or '', path = path or '', position = position, playing = reaper.GetPlayState() & 1 == 1, recording = reaper.GetPlayState() & 4 == 4 }
end

function Wise2Status() return state() end
function Wise2Play() reaper.OnStop(); reaper.Main_OnCommand(1007, 0); return state() end
function Wise2Stop() reaper.Main_OnCommand(1016, 0); return state() end
function Wise2Pause() reaper.Main_OnCommand(1008, 0); return state() end
function Wise2Record() reaper.Main_OnCommand(1013, 0); return state() end
function Wise2Marker(name) reaper.AddProjectMarker2(0, false, reaper.GetCursorPosition(), 0, name, -1); return state() end
