'use client';

import { Button, HUDPanel } from '@/components/enterprise';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex">
      {/* LEFT SIDEBAR */}
      <div className="w-72 border-r border-chaos-electric/40 px-8 py-12 overflow-y-auto bg-black">
        <div className="mb-24">
          <div className="text-3xl font-bold text-white mb-2">WISE²</div>
          <div className="text-sm text-chaos-ice font-mono leading-relaxed">
            SOUND LABS<br/>
            ORGANIZED CHAOS COMMAND CENTER
          </div>
        </div>

        <nav className="space-y-6 mb-20">
          {[
            { icon: '●', name: 'STUDIO', desc: 'Command Center' },
            { icon: '◆', name: 'BRAND DNA', desc: 'Identity Engine' },
            { icon: '♪', name: 'ANTHEM CREATOR', desc: 'Song & Lyrics Studio' },
            { icon: '◎', name: 'RECORDING ROOM', desc: 'Sessions & Audio' },
            { icon: '〰', name: 'MIXING CONSOLE', desc: 'Mix & Produce' },
            { icon: '◈', name: 'MASTERING', desc: 'Polish & Perfect' },
            { icon: '◄►', name: 'LIVE', desc: 'Watch & Interact', live: true },
            { icon: '●', name: 'COMMUNITY', desc: 'Connect & Collaborate' },
            { icon: '★', name: 'CHALLENGES', desc: 'Compete & Win' },
            { icon: '⊕', name: 'ACADEMY', desc: 'Learn & Level Up' },
            { icon: '▲', name: 'BRAND VAULT', desc: 'Assets & Deliverables' },
            { icon: '📊', name: 'ANALYTICS', desc: 'Insights & Growth' },
            { icon: '⚙', name: 'SETTINGS', desc: 'System & Preferences' },
          ].map((item) => (
            <div key={item.name} className="group cursor-pointer pb-2 border-l-2 border-chaos-electric/30 pl-4 group-hover:border-chaos-ice/60 transition-colors">
              <div className="text-chaos-ice font-bold text-sm mb-1 flex items-center gap-2">
                {item.name}
                {item.live && <span className="text-red-500 text-xs px-2 py-0.5 bg-red-500/20 rounded">LIVE</span>}
              </div>
              <div className="text-gray-500 text-xs">{item.desc}</div>
            </div>
          ))}
        </nav>

        <div className="border-t border-chaos-electric/30 pt-8">
          <div className="text-sm font-mono text-chaos-ice font-bold mb-4">SYSTEM STATUS</div>
          <div className="text-sm text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            ALL SYSTEMS OPERATIONAL
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col bg-black">
        {/* TOP BAR */}
        <div className="border-b border-chaos-electric/30 bg-black/50 backdrop-blur px-12 py-6 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-12">
            <div className="flex items-center gap-6 flex-1">
              <div className="text-chaos-ice text-sm">🔍 Search projects, artists, files...</div>
              <div className="text-gray-600 text-xs">⌘ K</div>
            </div>
            <div className="flex items-center gap-20">
              <div className="text-center">
                <div className="text-red-500 text-2xl mb-2">●</div>
                <div className="text-xs text-chaos-ice font-semibold">LIVE VIEWERS</div>
                <div className="text-white font-bold text-xl mt-1">358</div>
              </div>
              <div className="text-center">
                <div style={{ fontSize: '20px' }} className="text-chaos-ice mb-2">📋</div>
                <div className="text-xs text-chaos-ice font-semibold">PROJECTS LIVE</div>
                <div className="text-white font-bold text-xl mt-1">4</div>
              </div>
              <div className="text-center">
                <div style={{ fontSize: '20px' }} className="text-chaos-ice mb-2">👥</div>
                <div className="text-xs text-chaos-ice font-semibold">COMMUNITY ONLINE</div>
                <div className="text-white font-bold text-xl mt-1">1,247</div>
              </div>
              <div className="w-10 h-10 rounded border border-chaos-ice/50 flex items-center justify-center text-sm">👤</div>
              <div className="text-xs leading-relaxed">
                <div className="text-white font-semibold">D.WISE</div>
                <div className="text-gray-400">Administrator</div>
              </div>
              <div className="flex gap-3">
                <button className="w-8 h-8 rounded border border-chaos-ice/30 flex items-center justify-center hover:bg-chaos-electric/20 text-sm">🔔</button>
                <button className="w-8 h-8 rounded border border-chaos-ice/30 flex items-center justify-center hover:bg-chaos-electric/20 text-sm">✉️</button>
                <button className="w-8 h-8 rounded border border-chaos-ice/30 flex items-center justify-center hover:bg-chaos-electric/20 text-sm">⚙️</button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="flex-1 overflow-auto">
          <div className="p-12 grid grid-cols-3 gap-12">
            {/* CENTER COLUMN */}
            <div className="col-span-2 space-y-12">
              {/* LIVE STUDIO */}
              <div className="border border-chaos-electric/40 rounded-sm overflow-hidden bg-black/40">
                <div className="relative h-96 bg-gradient-to-b from-chaos-blue/10 to-black flex items-center justify-center overflow-hidden border-b border-chaos-electric/40">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-12 right-12 w-64 h-64 bg-chaos-electric rounded-full blur-3xl"></div>
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-7xl text-chaos-ice mb-6">⦿</div>
                    <div className="text-3xl font-bold text-chaos-ice font-mono">WISE SOUND LABS</div>
                  </div>
                  <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/80 px-4 py-2 rounded border-2 border-red-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-500 text-xs font-bold">LIVE</span>
                  </div>
                  <div className="absolute top-6 left-6 text-chaos-ice font-mono text-sm">00:42:17 ELAPSED</div>
                </div>

                <div className="p-12">
                  <div className="text-xs text-chaos-ice font-mono font-bold mb-6 tracking-widest">NOW BUILDING</div>
                  <h2 className="text-5xl font-bold text-white mb-12">Urban Grind Brand Anthem</h2>

                  <div className="flex gap-2 mb-12 overflow-x-auto pb-4 border-b border-chaos-electric/20">
                    {[
                      { name: 'BRAND DNA', done: true },
                      { name: 'LYRICS', done: true },
                      { name: 'BEAT PROD.', done: true },
                      { name: 'RECORDING', done: true },
                      { name: 'MIXING', done: false },
                      { name: 'MASTERING', done: false },
                      { name: 'DELIVERY', done: false },
                    ].map((stage) => (
                      <div key={stage.name} className={`px-6 py-3 border-b-2 text-sm font-bold whitespace-nowrap ${
                        stage.done ? 'border-chaos-ice text-chaos-ice' : 'border-gray-700 text-gray-500'
                      }`}>
                        {stage.name}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center gap-12">
                    <div className="flex gap-20">
                      <div className="text-center">
                        <div className="text-4xl mb-4">👍</div>
                        <div className="text-white font-bold text-2xl">358</div>
                        <div className="text-xs text-gray-400 mt-2">LIKES</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl mb-4">💬</div>
                        <div className="text-white font-bold text-2xl">219</div>
                        <div className="text-xs text-gray-400 mt-2">COMMENTS</div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button className="px-6 py-3 border border-gray-600 text-gray-400 text-sm rounded hover:border-chaos-ice hover:text-chaos-ice transition-colors">🔊 UNMUTE</button>
                      <Button variant="primary" size="sm">▶ WATCH LIVE</Button>
                      <button className="px-6 py-3 border border-gray-600 text-gray-400 text-sm rounded hover:border-chaos-ice hover:text-chaos-ice transition-colors">📌 ADD REMINDER</button>
                      <button className="px-6 py-3 border border-gray-600 text-gray-400 text-sm rounded hover:border-chaos-ice hover:text-chaos-ice transition-colors">↗ SHARE</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SCHEDULE & PROJECTS */}
              <div className="grid grid-cols-2 gap-12">
                <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-bold text-chaos-ice">LIVE SCHEDULE</h3>
                    <a href="#" className="text-xs text-chaos-ice hover:underline">VIEW FULL SCHEDULE</a>
                  </div>
                  <div className="space-y-6">
                    {[
                      { day: 'MON', event: 'Brand DNA Live', time: '10:00 AM' },
                      { day: 'TUE', event: 'Anthem Creation', time: '12:00 PM', live: true },
                      { day: 'WED', event: 'WISE² Development', time: '03:00 PM' },
                      { day: 'THU', event: 'Community Reviews', time: '05:00 PM' },
                      { day: 'FRI', event: 'Client Showcase', time: '05:00 PM' },
                    ].map((item) => (
                      <div key={item.day} className="text-sm border-b border-chaos-electric/20 pb-4 flex justify-between">
                        <div>
                          <div className="text-white font-semibold">{item.day} • {item.event}</div>
                          <div className="text-gray-500 text-xs mt-1">{item.time}</div>
                        </div>
                        {item.live && <span className="text-red-500 font-bold text-xs">LIVE</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-bold text-chaos-ice">ACTIVE PROJECTS</h3>
                    <a href="#" className="text-xs text-chaos-ice hover:underline">VIEW ALL</a>
                  </div>
                  <div className="space-y-6">
                    {[
                      { name: 'Urban Grid Anthem', status: 'LIVE', progress: 62 },
                      { name: 'Royal Cuisine Jingle', status: 'Commercial', progress: 45 },
                      { name: 'Iron Fitness Campaign', status: 'Motivational', progress: 75 },
                    ].map((project) => (
                      <div key={project.name} className="border border-chaos-electric/30 rounded p-4 bg-black/30">
                        <div className="flex justify-between mb-3">
                          <span className="text-sm font-semibold text-white">{project.name}</span>
                          <span className={`text-xs font-bold ${project.status === 'LIVE' ? 'text-red-500' : 'text-gray-500'}`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-chaos-blue to-chaos-electric"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-3">{project.progress}% complete</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* COMMUNITY FEED */}
              <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-sm font-bold text-chaos-ice">COMMUNITY FEED</h3>
                  <a href="#" className="text-xs text-chaos-ice hover:underline">VIEW ALL</a>
                </div>
                <div className="space-y-6">
                  {[
                    { user: 'SoundWave', msg: 'WISE² hits different! 🔥', time: '2h ago' },
                    { user: 'BeatMaster88', msg: 'Just finished the brand DNA interview! Really feeling the energy 💪', time: '2h ago' },
                    { user: 'CreativeEye', msg: 'The transition is 🔥', time: '1h ago' },
                  ].map((item) => (
                    <div key={item.user} className="border-b border-chaos-electric/20 pb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-bold text-chaos-ice">@{item.user}</span>
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                      <p className="text-sm text-gray-300">{item.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-12">
              {/* LIVE CHAT */}
              <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-chaos-ice text-lg">💬</span>
                  <h3 className="text-sm font-bold text-chaos-ice">LIVE CHAT</h3>
                  <span className="text-xs text-chaos-ice">358</span>
                </div>
                <div className="text-xs text-gray-500 mb-6">Top Chat</div>
                <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
                  {[
                    { user: 'ProducerMind', msg: 'That bass line is 🔥🔥🔥' },
                    { user: 'BeatsbyRay', msg: 'This is crazy! Already feel the energy' },
                    { user: 'CreativeEye', msg: 'The transition is 🔥' },
                    { user: 'dJ.Phantom', msg: 'That hook is gonna slip in the clubs' },
                    { user: 'SoundWave', msg: 'WISE² never misses! 🎤' },
                    { user: 'AI.MAESTRO', msg: 'Remember to drop your feedback!' },
                    { user: 'D.WISE', msg: "Appreciate y'all rocking with us! 🙌" },
                  ].map((chat) => (
                    <div key={chat.user} className="pb-3 border-b border-chaos-electric/20">
                      <div className="text-chaos-ice text-sm font-bold">{chat.user}</div>
                      <div className="text-gray-300 text-xs mt-1">{chat.msg}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Say something..." className="flex-1 bg-black/50 border border-chaos-electric/30 px-4 py-2 text-xs text-white rounded" />
                  <button className="bg-chaos-blue text-white px-4 py-2 text-xs rounded font-bold hover:bg-chaos-ice hover:text-black">SEND</button>
                </div>
              </div>

              {/* DISCORD */}
              <div className="border border-chaos-electric/40 rounded-sm p-8 bg-gradient-to-b from-chaos-blue/10 to-black">
                <h3 className="text-sm font-bold text-chaos-ice mb-4">JOIN THE COMMUNITY</h3>
                <p className="text-xs text-gray-300 mb-3">ON DISCORD</p>
                <p className="text-xs text-gray-400 mb-6">The official hub for creators, builders, entrepreneurs and dreamers.</p>
                <ul className="text-xs text-gray-400 space-y-2 mb-6">
                  <li>• Connect</li>
                  <li>• Collaborate</li>
                  <li>• Get Feedback</li>
                  <li>• Win Prizes</li>
                  <li>• Be Part of the Movement</li>
                </ul>
                <Button variant="primary" size="sm" className="w-full mb-4">🎮 JOIN DISCORD</Button>
                <div className="text-xs text-gray-500">1,247 MEMBERS ONLINE</div>
              </div>

              {/* LEADERBOARD */}
              <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-4">COMMUNITY LEADERBOARD</h3>
                <div className="text-xs text-gray-500 mb-6">THIS MONTH</div>
                <div className="space-y-4">
                  {[
                    { rank: 1, user: 'SoundWave', xp: '12,450' },
                    { rank: 2, user: 'BeatMaster88', xp: '9,870' },
                    { rank: 3, user: 'CreativeEye', xp: '8,230' },
                    { rank: 4, user: 'DJ Phantom', xp: '7,110' },
                    { rank: 5, user: 'BrandKing', xp: '6,540' },
                  ].map((item) => (
                    <div key={item.rank} className="flex justify-between text-xs border-b border-chaos-electric/20 pb-3">
                      <div className="flex gap-3">
                        <span className="text-chaos-ice font-bold">#{item.rank}</span>
                        <span className="text-white">🔗 {item.user}</span>
                      </div>
                      <span className="text-chaos-ice font-bold">{item.xp} XP 👑</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* REWARDS */}
              <div className="border border-purple-500/40 rounded-sm p-8 bg-gradient-to-b from-purple-900/10 to-black text-center">
                <h3 className="text-xs font-bold text-purple-400 mb-2">EARN XP. LEVEL UP.</h3>
                <h3 className="text-xs font-bold text-purple-400 mb-4">UNLOCK REWARDS.</h3>
                <div className="w-20 h-20 rounded-lg border-2 border-purple-400 mx-auto flex items-center justify-center text-3xl mb-4">◆</div>
                <div className="text-xs font-bold text-purple-400">BECOME A WISE ELITE</div>
              </div>
            </div>
          </div>

          {/* BOTTOM METRICS */}
          <div className="border-t border-chaos-electric/30 p-12">
            <div className="grid grid-cols-4 gap-12">
              <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-6">LATEST FROM WISE²</h3>
                <div>
                  <div className="text-white font-semibold text-base mb-2">V2.4.1 UPDATE</div>
                  <div className="text-xs text-gray-400 mb-4">New features, performance boosts and more.</div>
                  <button className="text-xs text-chaos-ice border border-chaos-electric px-3 py-2 rounded hover:bg-chaos-electric/10">VIEW UPDATE</button>
                </div>
              </div>

              <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-6">ROADMAP PROGRESS</h3>
                <div className="text-xs">
                  <div className="text-chaos-ice font-bold mb-3">Q3 2025</div>
                  <div className="flex gap-1 mb-4">
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-chaos-ice text-lg">◇</span>
                    <span className="text-chaos-ice text-lg">◇</span>
                    <span className="text-gray-700 text-lg">◇</span>
                  </div>
                  <div className="text-gray-400">4 / 6 COMPLETED</div>
                </div>
              </div>

              <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-6">PLATFORM METRICS</h3>
                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <div className="text-white font-bold text-2xl mb-1">2,543</div>
                    <div className="text-gray-500 text-xs">PROJECTS</div>
                    <div className="text-gray-600 text-xs">COMPLETED</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-2xl mb-1">1,128</div>
                    <div className="text-gray-500 text-xs">HAPPY</div>
                    <div className="text-gray-600 text-xs">CLIENTS</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-2xl mb-1">99.8%</div>
                    <div className="text-gray-500 text-xs">CLIENT</div>
                    <div className="text-gray-600 text-xs">SATISFACTION</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-2xl mb-1">23</div>
                    <div className="text-gray-500 text-xs">COUNTRIES</div>
                    <div className="text-gray-600 text-xs">SERVED</div>
                  </div>
                </div>
              </div>

              <div className="border border-chaos-electric/40 rounded-sm p-8 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-6">WISE² ENTERPRISE</h3>
                <div className="space-y-3">
                  {[
                    { icon: '🚀', name: 'PROJECT GENESIS', sub: 'The Blueprint' },
                    { icon: '📊', name: 'PROJECT ATLAS', sub: 'The Platform' },
                    { icon: '⚙️', name: 'PROJECT ORBIT', sub: 'The Operations' },
                  ].map((proj) => (
                    <div key={proj.name} className="text-center text-xs py-3 border border-chaos-electric/40 rounded hover:border-chaos-ice/50 cursor-pointer">
                      <div className="text-xl mb-2">{proj.icon}</div>
                      <div className="text-gray-300 font-semibold">{proj.name}</div>
                      <div className="text-gray-500 text-xs mt-1">{proj.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
