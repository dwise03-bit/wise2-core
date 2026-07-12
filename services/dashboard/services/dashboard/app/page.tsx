'use client';

import { Button, HUDPanel } from '@/components/enterprise';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex">
      {/* LEFT SIDEBAR - NAVIGATION */}
      <div className="w-56 border-r border-chaos-electric/40 p-8 overflow-y-auto bg-gradient-to-b from-black to-black">
        <div className="mb-16">
          <div className="text-xl font-bold text-white">WISE²</div>
          <div className="text-xs text-chaos-ice font-mono leading-tight mt-1">
            SOUND LABS<br/>
            ORGANIZED CHAOS COMMAND CENTER
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-3 mb-12">
          {[
            { icon: '◯', name: 'STUDIO', desc: 'Command Center' },
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
            <div key={item.name} className="group cursor-pointer">
              <div className="flex items-center gap-2 pb-2 border-l-2 border-chaos-electric/30 pl-3 group-hover:border-chaos-ice/60 transition-colors">
                <div className="text-chaos-ice text-sm">{item.icon}</div>
                <div>
                  <div className="text-chaos-ice text-xs font-bold flex items-center gap-2">
                    {item.name}
                    {item.live && <span className="text-red-500 text-xs bg-red-500/20 px-1 rounded">LIVE</span>}
                  </div>
                  <div className="text-gray-500 text-xs">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Status */}
        <div className="border-t border-chaos-electric/30 pt-8 mt-8">
          <div className="text-xs font-mono text-chaos-ice font-bold mb-3">SYSTEM STATUS</div>
          <div className="text-xs text-green-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            ALL SYSTEMS OPERATIONAL
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col bg-black">
        {/* TOP BAR */}
        <div className="border-b border-chaos-electric/30 bg-black/50 backdrop-blur px-8 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="text-chaos-ice text-sm">🔍 Search projects, artists, files...</div>
              <div className="text-gray-600 text-xs">⌘ K</div>
            </div>
            <div className="flex items-center gap-12">
              <div className="text-center">
                <div className="text-red-500 text-lg">●</div>
                <div className="text-xs text-chaos-ice mt-1">LIVE VIEWERS</div>
                <div className="text-white font-bold text-lg">358</div>
              </div>
              <div className="text-center">
                <div className="text-chaos-ice text-lg">📋</div>
                <div className="text-xs text-chaos-ice mt-1">PROJECTS LIVE</div>
                <div className="text-white font-bold text-lg">4</div>
              </div>
              <div className="text-center">
                <div className="text-chaos-ice text-lg">👥</div>
                <div className="text-xs text-chaos-ice mt-1">COMMUNITY ONLINE</div>
                <div className="text-white font-bold text-lg">1,247</div>
              </div>
              <div className="w-8 h-8 rounded border border-chaos-ice/50 flex items-center justify-center text-xs">👤</div>
              <div className="text-xs">
                <div className="text-white font-semibold">D.WISE</div>
                <div className="text-gray-400">Administrator</div>
              </div>
              <div className="flex gap-2">
                <button className="w-6 h-6 rounded border border-chaos-ice/30 flex items-center justify-center hover:bg-chaos-electric/20 text-xs">🔔</button>
                <button className="w-6 h-6 rounded border border-chaos-ice/30 flex items-center justify-center hover:bg-chaos-electric/20 text-xs">✉️</button>
                <button className="w-6 h-6 rounded border border-chaos-ice/30 flex items-center justify-center hover:bg-chaos-electric/20 text-xs">⚙️</button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="flex-1 overflow-auto">
          <div className="p-8 grid grid-cols-3 gap-8">
            {/* CENTER - LIVE STUDIO & CONTENT */}
            <div className="col-span-2 space-y-8">
              {/* LIVE STUDIO */}
              <div className="border border-chaos-electric/40 rounded-sm overflow-hidden bg-black/40">
                {/* Video Area */}
                <div className="relative h-96 bg-gradient-to-b from-chaos-blue/10 to-black flex items-center justify-center overflow-hidden border-b border-chaos-electric/40">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-12 right-12 w-64 h-64 bg-chaos-electric rounded-full blur-3xl"></div>
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="text-6xl text-chaos-ice mb-4">⦿</div>
                    <div className="text-2xl font-bold text-chaos-ice font-mono">WISE SOUND LABS</div>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/80 px-3 py-1 rounded border-2 border-red-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-500 text-xs font-bold">LIVE</span>
                  </div>
                  <div className="absolute top-4 left-4 text-chaos-ice font-mono text-sm">00:42:17 ELAPSED</div>
                </div>

                {/* Info Section */}
                <div className="p-8">
                  <div className="text-xs text-chaos-ice font-mono font-bold mb-4 tracking-widest">NOW BUILDING</div>
                  <h2 className="text-4xl font-bold text-white mb-8">Urban Grind Brand Anthem</h2>

                  {/* Progress Tabs */}
                  <div className="flex gap-1 mb-8 overflow-x-auto pb-2 border-b border-chaos-electric/20">
                    {[
                      { name: 'BRAND DNA', status: 'completed' },
                      { name: 'LYRICS', status: 'completed' },
                      { name: 'BEAT PROD.', status: 'completed' },
                      { name: 'RECORDING', status: 'completed' },
                      { name: 'MIXING', status: 'waiting' },
                      { name: 'MASTERING', status: 'waiting' },
                      { name: 'DELIVERY', status: 'waiting' },
                    ].map((stage) => (
                      <div key={stage.name} className={`px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap ${
                        stage.status === 'completed'
                          ? 'border-chaos-ice text-chaos-ice'
                          : 'border-gray-700 text-gray-500'
                      }`}>
                        {stage.name}
                      </div>
                    ))}
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-12">
                      <div className="text-center">
                        <div className="text-2xl mb-2">👍</div>
                        <div className="text-white font-bold text-lg">358</div>
                        <div className="text-xs text-gray-400">LIKES</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-2">💬</div>
                        <div className="text-white font-bold text-lg">219</div>
                        <div className="text-xs text-gray-400">COMMENTS</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 border border-gray-600 text-gray-400 text-xs rounded hover:border-chaos-ice hover:text-chaos-ice transition-colors">🔊 UNMUTE</button>
                      <Button variant="primary" size="sm">▶ WATCH LIVE</Button>
                      <button className="px-4 py-2 border border-gray-600 text-gray-400 text-xs rounded hover:border-chaos-ice hover:text-chaos-ice transition-colors">📌 ADD REMINDER</button>
                      <button className="px-4 py-2 border border-gray-600 text-gray-400 text-xs rounded hover:border-chaos-ice hover:text-chaos-ice transition-colors">↗ SHARE</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SCHEDULE & PROJECTS */}
              <div className="grid grid-cols-2 gap-8">
                <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-chaos-ice">LIVE SCHEDULE</h3>
                    <a href="#" className="text-xs text-chaos-ice hover:underline">VIEW FULL SCHEDULE</a>
                  </div>
                  <div className="space-y-3">
                    {[
                      { day: 'MON', event: 'Brand DNA Live', time: '10:00 AM' },
                      { day: 'TUE', event: 'Anthem Creation', time: '12:00 PM', live: true },
                      { day: 'WED', event: 'WISE² Development', time: '03:00 PM' },
                      { day: 'THU', event: 'Community Reviews', time: '05:00 PM' },
                      { day: 'FRI', event: 'Client Showcase', time: '05:00 PM' },
                      { day: 'SAT', event: 'Q&A + Tutorials', time: '01:00 PM' },
                      { day: 'SUN', event: 'Roadmap & Planning', time: '02:00 PM' },
                    ].map((item) => (
                      <div key={item.day} className="text-xs border-b border-chaos-electric/20 pb-2 flex justify-between">
                        <div>
                          <div className="text-white font-semibold">{item.day} • {item.event}</div>
                          <div className="text-gray-500">{item.time}</div>
                        </div>
                        {item.live && <span className="text-red-500 font-bold">LIVE</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-chaos-ice">ACTIVE PROJECTS</h3>
                    <a href="#" className="text-xs text-chaos-ice hover:underline">VIEW ALL</a>
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'Urban Grid Anthem', status: 'LIVE', progress: 62 },
                      { name: 'Royal Cuisine Jingle', status: 'Commercial', progress: 45 },
                      { name: 'Iron Fitness Campaign', status: 'Motivational', progress: 75 },
                      { name: 'Elevate Realty Theme', status: 'Corporate', progress: 30 },
                    ].map((project) => (
                      <div key={project.name} className="border border-chaos-electric/30 rounded p-3 bg-black/30">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-semibold text-white">{project.name}</span>
                          <span className={`text-xs font-bold ${project.status === 'LIVE' ? 'text-red-500' : 'text-gray-500'}`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-gray-800 rounded overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-chaos-blue to-chaos-electric"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">{project.progress}% • Hip Hop / Trip</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* COMMUNITY FEED */}
              <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-chaos-ice">COMMUNITY FEED</h3>
                  <a href="#" className="text-xs text-chaos-ice hover:underline">VIEW ALL</a>
                </div>
                <div className="space-y-4">
                  {[
                    { user: 'SoundWave', msg: 'WISE² hits different! 🔥', time: '2h ago' },
                    { user: 'BeatMaster88', msg: 'Just finished the brand DNA interview! Really feeling the energy 💪', time: '2h ago' },
                    { user: 'CreativeEye', msg: 'The transition is 🔥', time: '1h ago' },
                  ].map((item) => (
                    <div key={item.user} className="border-b border-chaos-electric/20 pb-3">
                      <div className="flex justify-between">
                        <span className="text-xs font-bold text-chaos-ice">@{item.user}</span>
                        <span className="text-xs text-gray-500">{item.time}</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{item.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-8">
              {/* LIVE CHAT */}
              <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-chaos-ice">💬</span>
                  <h3 className="text-sm font-bold text-chaos-ice">LIVE CHAT</h3>
                  <span className="text-xs text-chaos-ice">358</span>
                </div>
                <div className="text-xs text-gray-500 mb-4">Top Chat</div>
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {[
                    { user: 'ProducerMind', msg: 'That bass line is 🔥🔥🔥' },
                    { user: 'BeatsbyRay', msg: 'This is crazy! Already feel the energy' },
                    { user: 'CreativeEye', msg: 'The transition is 🔥' },
                    { user: 'dJ.Phantom', msg: 'That hook is gonna slip in the clubs' },
                    { user: 'SoundWave', msg: 'WISE² never misses! 🎤' },
                    { user: 'AI.MAESTRO', msg: 'Remember to drop your feedback!' },
                    { user: 'D.WISE', msg: "Appreciate y'all rocking with us! 🙌" },
                  ].map((chat) => (
                    <div key={chat.user} className="text-xs">
                      <div className="text-chaos-ice font-bold">{chat.user}</div>
                      <div className="text-gray-300">{chat.msg}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Say something..." className="flex-1 bg-black/50 border border-chaos-electric/30 px-3 py-2 text-xs text-white rounded" />
                  <button className="bg-chaos-blue text-white px-3 py-2 text-xs rounded font-bold hover:bg-chaos-ice hover:text-black">SEND</button>
                </div>
              </div>

              {/* DISCORD */}
              <div className="border border-chaos-electric/40 rounded-sm p-6 bg-gradient-to-b from-chaos-blue/10 to-black">
                <h3 className="text-sm font-bold text-chaos-ice mb-3">JOIN THE COMMUNITY</h3>
                <p className="text-xs text-gray-300 mb-3">ON DISCORD</p>
                <p className="text-xs text-gray-400 mb-4">The official hub for creators, builders, entrepreneurs and dreamers.</p>
                <ul className="text-xs text-gray-400 space-y-1 mb-4">
                  <li>• Connect</li>
                  <li>• Collaborate</li>
                  <li>• Get Feedback</li>
                  <li>• Win Prizes</li>
                  <li>• Be Part of the Movement</li>
                </ul>
                <Button variant="primary" size="sm" className="w-full mb-3">🎮 JOIN DISCORD</Button>
                <div className="text-xs text-gray-500">1,247 MEMBERS ONLINE</div>
              </div>

              {/* LEADERBOARD */}
              <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-4">COMMUNITY LEADERBOARD</h3>
                <div className="text-xs text-gray-500 mb-3">THIS MONTH</div>
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
                        <span className="text-chaos-ice font-bold">#{item.rank}</span>
                        <span className="text-white">🔗 {item.user}</span>
                      </div>
                      <span className="text-chaos-ice font-bold">{item.xp} XP 👑</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* REWARDS */}
              <div className="border border-purple-500/40 rounded-sm p-6 bg-gradient-to-b from-purple-900/10 to-black text-center">
                <h3 className="text-xs font-bold text-purple-400 mb-2">EARN XP. LEVEL UP.</h3>
                <h3 className="text-xs font-bold text-purple-400 mb-3">UNLOCK REWARDS.</h3>
                <div className="text-purple-400 text-xs mb-3">BECOME A WISE ELITE</div>
                <div className="w-16 h-16 rounded-lg border-2 border-purple-400 mx-auto flex items-center justify-center text-2xl">◆</div>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTIONS */}
          <div className="border-t border-chaos-electric/30 p-8">
            <div className="grid grid-cols-4 gap-8">
              <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-4">LATEST FROM WISE²</h3>
                <div>
                  <div className="text-white font-semibold text-sm mb-1">V2.4.1 UPDATE</div>
                  <div className="text-xs text-gray-400 mb-3">New features, performance boosts and more.</div>
                  <button className="text-xs text-chaos-ice border border-chaos-electric px-2 py-1 rounded hover:bg-chaos-electric/10">VIEW UPDATE</button>
                </div>
              </div>

              <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-4">ROADMAP PROGRESS</h3>
                <div className="text-xs">
                  <div className="text-chaos-ice font-bold mb-2">Q3 2025</div>
                  <div className="flex gap-1 mb-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-green-400">✓</span>
                    <span className="text-chaos-ice">◇</span>
                    <span className="text-chaos-ice">◇</span>
                    <span className="text-gray-700">◇</span>
                  </div>
                  <div className="text-gray-400">4 / 6 COMPLETED</div>
                  <button className="text-xs text-chaos-ice border border-chaos-electric px-2 py-1 rounded mt-2 hover:bg-chaos-electric/10">VIEW ROADMAP</button>
                </div>
              </div>

              <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-4">PLATFORM METRICS</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-white font-bold text-lg">2,543</div>
                    <div className="text-gray-500 text-xs">PROJECTS</div>
                    <div className="text-gray-600 text-xs">COMPLETED</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">1,128</div>
                    <div className="text-gray-500 text-xs">HAPPY</div>
                    <div className="text-gray-600 text-xs">CLIENTS</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">99.8%</div>
                    <div className="text-gray-500 text-xs">CLIENT</div>
                    <div className="text-gray-600 text-xs">SATISFACTION</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">23</div>
                    <div className="text-gray-500 text-xs">COUNTRIES</div>
                    <div className="text-gray-600 text-xs">SERVED</div>
                  </div>
                </div>
              </div>

              <div className="border border-chaos-electric/40 rounded-sm p-6 bg-black/40">
                <h3 className="text-sm font-bold text-chaos-ice mb-4">WISE² ENTERPRISE</h3>
                <div className="space-y-2">
                  {[
                    { icon: '🚀', name: 'PROJECT GENESIS', sub: 'The Blueprint' },
                    { icon: '📊', name: 'PROJECT ATLAS', sub: 'The Platform' },
                    { icon: '⚙️', name: 'PROJECT ORBIT', sub: 'The Operations' },
                  ].map((proj) => (
                    <div key={proj.name} className="text-center text-xs py-2 border border-chaos-electric/40 rounded hover:border-chaos-ice/50 cursor-pointer">
                      <div className="text-lg mb-1">{proj.icon}</div>
                      <div className="text-gray-300 font-semibold">{proj.name}</div>
                      <div className="text-gray-500 text-xs">{proj.sub}</div>
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
