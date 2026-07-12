'use client';

import { Button, HUDPanel } from '@/components/enterprise';

export default function HomePage() {
  return (
    <main className="min-h-screen blueprint-bg flex bg-black">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-chaos-electric/50 p-6 overflow-y-auto bg-black">
        <div className="mb-12">
          <div className="text-2xl font-bold text-white mb-1">WISE²</div>
          <div className="text-xs text-chaos-ice font-mono">SOUND LABS</div>
          <div className="text-xs text-gray-400 mt-1">ORGANIZED CHAOS COMMAND CENTER</div>
        </div>

        <nav className="space-y-2">
          {[
            { label: 'STUDIO', sub: 'Command Center' },
            { label: 'BRAND DNA', sub: 'Identity Engine' },
            { label: 'ANTHEM CREATOR', sub: 'Song & Lyrics Studio' },
            { label: 'RECORDING ROOM', sub: 'Sessions & Audio' },
            { label: 'MIXING CONSOLE', sub: 'Mix & Produce' },
            { label: 'MASTERING', sub: 'Polish & Perfect' },
            { label: 'LIVE', sub: 'Watch & Interact', live: true },
            { label: 'COMMUNITY', sub: 'Connect & Collaborate' },
            { label: 'CHALLENGES', sub: 'Compete & Win' },
            { label: 'ACADEMY', sub: 'Learn & Level Up' },
            { label: 'BRAND VAULT', sub: 'Assets & Deliverables' },
            { label: 'ANALYTICS', sub: 'Insights & Growth' },
            { label: 'SETTINGS', sub: 'System & Preferences' },
          ].map((item) => (
            <div key={item.label} className="border-l-2 border-chaos-electric/30 pl-3 py-2 hover:border-chaos-ice/50 cursor-pointer transition-colors">
              <div className="text-chaos-ice font-bold text-sm flex items-center gap-2">
                {item.label}
                {item.live && <span className="text-red-500 text-xs">LIVE</span>}
              </div>
              <div className="text-xs text-gray-400">{item.sub}</div>
            </div>
          ))}
        </nav>

        <div className="mt-12 pt-8 border-t border-chaos-electric/30">
          <div className="text-2xl font-bold text-white mb-1">WISE²</div>
          <div className="text-xs text-chaos-ice font-mono mb-4">SOUND LABS</div>
          <div className="text-xs text-chaos-ice font-mono mb-2">SYSTEM STATUS</div>
          <div className="text-xs text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            ALL SYSTEMS OPERATIONAL
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto bg-black">
        {/* TOP BAR */}
        <div className="border-b border-chaos-electric/30 p-4 flex items-center justify-between bg-black/80 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-white text-sm font-mono">🔍 Search projects, artists, files...</div>
            <div className="text-gray-400 text-xs">⌘ K</div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-red-500 text-lg">●</div>
              <div className="text-xs text-chaos-ice">LIVE VIEWERS</div>
              <div className="text-white font-bold">358</div>
            </div>
            <div className="text-center">
              <div className="text-chaos-ice text-lg">📋</div>
              <div className="text-xs text-chaos-ice">PROJECTS LIVE</div>
              <div className="text-white font-bold">4</div>
            </div>
            <div className="text-center">
              <div className="text-chaos-ice text-lg">👥</div>
              <div className="text-xs text-chaos-ice">COMMUNITY ONLINE</div>
              <div className="text-white font-bold">1,247</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border border-chaos-ice/50 flex items-center justify-center text-sm">👤</div>
              <div className="text-xs text-white">D.WISE<br/>Administrator</div>
            </div>
            <button className="w-8 h-8 rounded border border-chaos-ice/50 flex items-center justify-center hover:bg-chaos-electric/20">🔔</button>
            <button className="w-8 h-8 rounded border border-chaos-ice/50 flex items-center justify-center hover:bg-chaos-electric/20">✉️</button>
            <button className="w-8 h-8 rounded border border-chaos-ice/50 flex items-center justify-center hover:bg-chaos-electric/20">⚙️</button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          {/* CENTER - LIVE STUDIO */}
          <div className="col-span-2 space-y-6">
            {/* Live Studio */}
            <HUDPanel className="p-0 overflow-hidden">
              <div className="relative">
                {/* Fake video background */}
                <div className="w-full h-80 bg-gradient-to-b from-chaos-blue/10 to-black flex items-center justify-center relative overflow-hidden border-b border-chaos-electric/30">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-20 left-20 w-96 h-96 bg-chaos-electric rounded-full blur-3xl"></div>
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-chaos-ice text-7xl mb-4">⦿</div>
                    <div className="text-chaos-ice text-2xl font-mono font-bold">WISE SOUND LABS</div>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/80 px-3 py-1 rounded border-2 border-red-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-500 text-xs font-bold">LIVE</span>
                  </div>
                  <div className="absolute top-4 left-4 text-chaos-ice font-mono text-sm">00:42:17 ELAPSED</div>
                </div>

                <div className="p-6">
                  <div className="text-chaos-ice text-sm font-mono font-bold mb-4 tracking-wider">NOW BUILDING</div>
                  <h3 className="text-white text-3xl font-bold mb-6">Urban Grind Brand Anthem</h3>

                  <div className="flex gap-2 mb-6 text-xs overflow-x-auto pb-2">
                    {[
                      { label: 'BRAND DNA', status: 'COMPLETED', done: true },
                      { label: 'LYRICS', status: 'COMPLETED', done: true },
                      { label: 'BEAT PROD.', status: 'COMPLETED', done: true },
                      { label: 'RECORDING', status: 'WAITING', done: true },
                      { label: 'MIXING', status: 'WAITING', done: false },
                      { label: 'MASTERING', status: 'WAITING', done: false },
                      { label: 'DELIVERY', status: 'WAITING', done: false },
                    ].map((stage) => (
                      <div key={stage.label} className={`py-2 px-4 border-b-2 flex-shrink-0 ${stage.done ? 'border-chaos-ice text-chaos-ice' : 'border-gray-600 text-gray-400'}`}>
                        {stage.label}
                        <div className="text-xs text-gray-500 mt-1">{stage.status}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-8">
                      <div className="text-center">
                        <div className="text-chaos-ice text-2xl">👍</div>
                        <div className="text-white font-bold">358</div>
                        <div className="text-xs text-gray-400">LIKES</div>
                      </div>
                      <div className="text-center">
                        <div className="text-chaos-ice text-2xl">💬</div>
                        <div className="text-white font-bold">219</div>
                        <div className="text-xs text-gray-400">COMMENTS</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 border border-gray-600 text-gray-400 text-sm rounded hover:border-chaos-ice hover:text-chaos-ice hover:bg-chaos-electric/10">
                        🔊 UNMUTE
                      </button>
                      <Button variant="primary" size="sm">
                        ▶ WATCH LIVE
                      </Button>
                      <button className="px-4 py-2 border border-gray-600 text-gray-400 text-sm rounded hover:border-chaos-ice hover:text-chaos-ice hover:bg-chaos-electric/10">
                        📌 ADD REMINDER
                      </button>
                      <button className="px-4 py-2 border border-gray-600 text-gray-400 text-sm rounded hover:border-chaos-ice hover:text-chaos-ice hover:bg-chaos-electric/10">
                        ↗ SHARE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </HUDPanel>

            {/* Live Schedule & Active Projects */}
            <div className="grid grid-cols-2 gap-6">
              <HUDPanel>
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="text-chaos-ice font-bold text-sm">LIVE SCHEDULE</h4>
                  <div className="text-chaos-ice text-xs cursor-pointer hover:underline">VIEW FULL SCHEDULE</div>
                </div>
                <div className="space-y-3">
                  {[
                    { day: 'MON', title: 'Brand DNA Live', time: '10:00 AM' },
                    { day: 'TUE', title: 'Anthem Creation', time: '12:00 PM', live: true },
                    { day: 'WED', title: 'WISE² Development', time: '03:00 PM' },
                    { day: 'THU', title: 'Community Reviews', time: '05:00 PM' },
                    { day: 'FRI', title: 'Client Showcase', time: '05:00 PM' },
                    { day: 'SAT', title: 'Q&A + Tutorials', time: '01:00 PM' },
                    { day: 'SUN', title: 'Roadmap & Planning', time: '02:00 PM' },
                  ].map((item) => (
                    <div key={item.day} className="flex justify-between text-xs border-b border-chaos-electric/20 pb-2">
                      <div>
                        <div className="text-white font-semibold">{item.day} • {item.title}</div>
                        <div className="text-gray-400 text-xs">{item.time}</div>
                      </div>
                      {item.live && <span className="text-red-500 text-xs font-bold">LIVE</span>}
                    </div>
                  ))}
                </div>
              </HUDPanel>

              <HUDPanel>
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="text-chaos-ice font-bold text-sm">ACTIVE PROJECTS</h4>
                  <div className="text-chaos-ice text-xs cursor-pointer hover:underline">VIEW ALL</div>
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Urban Grid Anthem', status: 'LIVE', progress: 62 },
                    { title: 'Royal Cuisine Jingle', status: 'Commercial', progress: 45 },
                    { title: 'Iron Fitness Campaign', status: 'Motivational', progress: 75 },
                    { title: 'Elevate Realty Theme', status: 'Corporate', progress: 30 },
                  ].map((project) => (
                    <div key={project.title} className="border border-chaos-electric/30 rounded p-3">
                      <div className="flex justify-between mb-2">
                        <div className="text-white text-sm font-semibold">{project.title}</div>
                        <span className={`text-xs font-bold ${project.status === 'LIVE' ? 'text-red-500' : 'text-gray-400'}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded overflow-hidden">
                        <div
                          className="h-1 bg-gradient-to-r from-chaos-blue to-chaos-ice rounded"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        🔊 {project.progress}% • ▶ {Math.floor(project.progress / 10)} sections completed
                      </div>
                    </div>
                  ))}
                </div>
              </HUDPanel>
            </div>

            {/* Community Feed */}
            <HUDPanel>
              <div className="mb-4 flex justify-between items-center">
                <h4 className="text-chaos-ice font-bold text-sm">COMMUNITY FEED</h4>
                <div className="text-chaos-ice text-xs cursor-pointer hover:underline">VIEW ALL</div>
              </div>
              <div className="space-y-3">
                {[
                  { user: 'SoundWave', message: 'WISE² hits different! 🔥', time: '2h ago' },
                  { user: 'BeatMaster88', message: 'Just finished the brand DNA interview! Really feeling the energy 💪', time: '2h ago' },
                  { user: 'CreativeEye', message: 'The transition is 🔥', time: '1h ago' },
                  { user: 'DJ Phantom', message: 'That hook is gonna slip in the clubs 🎧', time: '1h ago' },
                  { user: 'BrandKing', message: "Can't wait to hear the final mix! 🚀", time: '45m ago' },
                ].map((item) => (
                  <div key={item.user} className="border-b border-chaos-electric/20 pb-3">
                    <div className="flex justify-between">
                      <div className="text-chaos-ice text-xs font-semibold">@{item.user}</div>
                      <div className="text-xs text-gray-400">{item.time}</div>
                    </div>
                    <div className="text-gray-300 text-xs mt-1">{item.message}</div>
                  </div>
                ))}
              </div>
            </HUDPanel>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* Live Chat */}
            <HUDPanel>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-chaos-ice">💬</span>
                  <h4 className="text-chaos-ice font-bold text-sm">LIVE CHAT</h4>
                  <span className="text-chaos-ice text-xs">358</span>
                </div>
                <div className="text-xs text-gray-400">Top Chat</div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {[
                  { user: 'ProducerMind', msg: 'That bass line is 🔥🔥🔥' },
                  { user: 'BeatsbyRay', msg: 'This is crazy! Already feel the energy' },
                  { user: 'CreativeEye', msg: 'The transition is 🔥' },
                  { user: 'dJ.Phantom', msg: 'That hook is gonna slip in the clubs' },
                  { user: 'SoundWave', msg: 'WISE² never misses! 🎤' },
                  { user: 'AI.MAESTRO', msg: 'Remember to drop your feedback and suggestions in the chat!' },
                  { user: 'D.WISE', msg: "Appreciate y'all rocking with us! Let's build 🙌" },
                ].map((chat) => (
                  <div key={chat.user} className="text-xs">
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-chaos-electric/20 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-chaos-ice font-semibold">{chat.user}</div>
                        <div className="text-gray-300 break-words">{chat.msg}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Say something..."
                  className="flex-1 bg-black/50 border border-chaos-electric/30 px-3 py-2 text-xs text-white rounded hover:border-chaos-ice/50 focus:border-chaos-ice focus:outline-none"
                />
                <button className="bg-chaos-blue text-white px-4 py-2 text-xs rounded font-semibold hover:bg-chaos-ice hover:text-black">SEND</button>
              </div>
            </HUDPanel>

            {/* Discord Join */}
            <HUDPanel className="bg-gradient-to-b from-chaos-blue/10 to-black border-chaos-electric/50">
              <h4 className="text-chaos-ice font-bold mb-3 text-sm">JOIN THE COMMUNITY</h4>
              <p className="text-gray-300 text-xs mb-4">ON DISCORD</p>
              <p className="text-gray-400 text-xs mb-4">The official hub for creators, builders, entrepreneurs and dreamers.</p>
              <div className="space-y-2 mb-4 text-xs text-gray-400">
                <div>• Connect</div>
                <div>• Collaborate</div>
                <div>• Get Feedback</div>
                <div>• Win Prizes</div>
                <div>• Be Part of the Movement</div>
              </div>
              <Button variant="primary" size="sm" className="w-full mb-3">
                🎮 JOIN DISCORD
              </Button>
              <div className="text-xs text-gray-400">1,247 MEMBERS ONLINE</div>
              <div className="flex gap-1 mt-2">
                <div className="w-5 h-5 rounded-full bg-chaos-electric/30"></div>
                <div className="w-5 h-5 rounded-full bg-chaos-electric/30"></div>
                <div className="w-5 h-5 rounded-full bg-chaos-electric/30"></div>
                <div className="text-xs text-gray-400 mt-1">+1.2k</div>
              </div>
            </HUDPanel>

            {/* Community Leaderboard */}
            <HUDPanel>
              <h4 className="text-chaos-ice font-bold mb-3 text-sm">COMMUNITY LEADERBOARD</h4>
              <div className="text-xs text-gray-400 mb-3">THIS MONTH</div>
              <div className="space-y-2">
                {[
                  { rank: 1, user: 'SoundWave', xp: '12,450' },
                  { rank: 2, user: 'BeatMaster88', xp: '9,870' },
                  { rank: 3, user: 'CreativeEye', xp: '8,230' },
                  { rank: 4, user: 'DJ Phantom', xp: '7,110' },
                  { rank: 5, user: 'BrandKing', xp: '6,540' },
                ].map((item) => (
                  <div key={item.rank} className="flex justify-between text-xs border-b border-chaos-electric/20 pb-2">
                    <div className="flex gap-2">
                      <div className="text-chaos-ice font-bold w-4">#{item.rank}</div>
                      <div className="text-white">🔗 {item.user}</div>
                    </div>
                    <div className="text-chaos-ice font-bold">{item.xp} XP 👑</div>
                  </div>
                ))}
              </div>
            </HUDPanel>

            {/* Rewards */}
            <HUDPanel className="border-chaos-electric/50 bg-gradient-to-b from-purple-900/20 to-black text-center">
              <h4 className="text-purple-400 font-bold mb-2 text-xs">EARN XP. LEVEL UP.</h4>
              <h4 className="text-purple-400 font-bold mb-3 text-xs">UNLOCK REWARDS.</h4>
              <div className="text-purple-400 text-xs mb-3">BECOME A WISE ELITE</div>
              <div className="w-16 h-16 rounded-lg border-2 border-purple-400 mx-auto flex items-center justify-center text-3xl">◆</div>
            </HUDPanel>
          </div>
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="px-6 pb-6 grid grid-cols-4 gap-6">
          <HUDPanel>
            <h4 className="text-chaos-ice font-bold mb-4 text-sm">LATEST FROM WISE²</h4>
            <div className="text-sm">
              <div className="text-white font-semibold mb-1">V2.4.1 UPDATE</div>
              <div className="text-xs text-gray-400 mb-3">New features, performance boosts and more.</div>
              <button className="text-chaos-ice text-xs border border-chaos-electric px-3 py-1 rounded hover:bg-chaos-electric/10">
                VIEW UPDATE
              </button>
            </div>
          </HUDPanel>

          <HUDPanel>
            <h4 className="text-chaos-ice font-bold mb-4 text-sm">ROADMAP PROGRESS</h4>
            <div className="text-xs">
              <div className="text-chaos-ice mb-3 font-bold">Q3 2025</div>
              <div className="space-y-1">
                <div className="flex gap-1">
                  <span className="text-green-400">✓</span>
                  <span className="text-green-400">✓</span>
                  <span className="text-chaos-ice">◇</span>
                  <span className="text-chaos-ice">◇</span>
                  <span className="text-gray-600">◇</span>
                </div>
                <div className="text-gray-400">4 / 6 COMPLETED</div>
              </div>
              <button className="text-chaos-ice text-xs border border-chaos-electric px-2 py-1 rounded mt-2 hover:bg-chaos-electric/10">
                VIEW ROADMAP
              </button>
            </div>
          </HUDPanel>

          <HUDPanel>
            <h4 className="text-chaos-ice font-bold mb-4 text-sm">PLATFORM METRICS</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-white font-bold text-lg">2,543</div>
                <div className="text-gray-400 text-xs">PROJECTS</div>
                <div className="text-gray-500 text-xs">COMPLETED</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">1,128</div>
                <div className="text-gray-400 text-xs">HAPPY</div>
                <div className="text-gray-500 text-xs">CLIENTS</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">99.8%</div>
                <div className="text-gray-400 text-xs">CLIENT</div>
                <div className="text-gray-500 text-xs">SATISFACTION</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">23</div>
                <div className="text-gray-400 text-xs">COUNTRIES</div>
                <div className="text-gray-500 text-xs">SERVED</div>
              </div>
            </div>
          </HUDPanel>

          <HUDPanel>
            <h4 className="text-chaos-ice font-bold mb-3 text-sm">WISE² ENTERPRISE</h4>
            <div className="space-y-2 text-xs">
              <div className="text-center py-2 border border-chaos-electric/50 rounded hover:border-chaos-ice/50 cursor-pointer">
                <div className="text-chaos-ice text-sm">🚀</div>
                <div className="text-gray-300 font-semibold">PROJECT</div>
                <div className="text-gray-400 text-xs">GENESIS</div>
                <div className="text-gray-500 text-xs">The Blueprint</div>
              </div>
              <div className="text-center py-2 border border-chaos-electric/50 rounded hover:border-chaos-ice/50 cursor-pointer">
                <div className="text-chaos-ice text-sm">📊</div>
                <div className="text-gray-300 font-semibold">PROJECT</div>
                <div className="text-gray-400 text-xs">ATLAS</div>
                <div className="text-gray-500 text-xs">The Platform</div>
              </div>
              <div className="text-center py-2 border border-chaos-electric/50 rounded hover:border-chaos-ice/50 cursor-pointer">
                <div className="text-chaos-ice text-sm">⚙️</div>
                <div className="text-gray-300 font-semibold">PROJECT</div>
                <div className="text-gray-400 text-xs">ORBIT</div>
                <div className="text-gray-500 text-xs">The Operations</div>
              </div>
            </div>
          </HUDPanel>
        </div>
      </div>
    </main>
  );
}
