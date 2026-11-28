import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  FileText, 
  Award, 
  ShoppingBag, 
  MessageCircle, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  CornerDownLeft, 
  Sparkles, 
  Coffee, 
  ShieldAlert, 
  Bug, 
  RefreshCw, 
  X,
  Flame,
  Skull
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AdminDecoyModal({ isOpen, onClose, whatsappNumber }) {
  const digits = (whatsappNumber || '7017324978').replace(/\D/g, '');
  const cleanPhone = digits.length === 10 ? `91${digits}` : (digits || '917017324978');
  const [activeTab, setActiveTab] = useState('terminal'); // 'terminal' | 'letter' | 'certificate'
  const [inputCommand, setInputCommand] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedFlag, setCopiedFlag] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState([
    {
      type: 'system',
      text: 'Last login: Today 03:14:22 on pts/0 (incognito-session)'
    },
    {
      type: 'warning',
      text: '⚠️ INTRUSION DETECTED: Someone tried to open /admin! Checking hacker credentials...'
    },
    {
      type: 'system',
      text: 'Result: Hacker found! Weapon: Kali Linux / F12 Inspect Element 😂'
    },
    {
      type: 'output',
      text: 'Type "help" to see commands, or tap any quick chip below.'
    }
  ]);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [isOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory, activeTab]);

  if (!isOpen) return null;

  // Sound generator using Web Audio API
  const playSound = (type = 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'denied') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.setValueAtTime(120, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {}
  };

  const handleReturnHome = () => {
    onClose();
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {
      window.location.href = '/';
    }
  };

  const executeCommand = (cmdText) => {
    const trimmed = (cmdText || '').trim();
    if (!trimmed) return;

    playSound('beep');
    const lower = trimmed.toLowerCase();

    const newEntries = [
      { type: 'command', text: `guest@cheapreels:~$ ${trimmed}` }
    ];

    if (lower === 'clear' || lower === 'cls') {
      setTerminalHistory([]);
      setInputCommand('');
      return;
    } else if (lower === 'help') {
      newEntries.push({
        type: 'output',
        text: `Available Commands:\n  • ls -la          : List all files on the server\n  • cat flag.txt    : Capture The Flag (CTF flag)\n  • cat passwords.txt : Check admin database passwords\n  • sudo su         : Gain root administrator privileges\n  • sqlmap          : Test for SQL injection vulnerabilities\n  • rm -rf /        : Try to destroy the server (warning!)\n  • chai            : Order a hot cup of cutting chai\n  • hire_me         : Message Vivek directly for collab/hiring\n  • buy_reels       : Give up hacking and buy 2,50,000 reels at ₹49\n  • clear           : Clear terminal screen`
      });
    } else if (lower === 'ls' || lower === 'ls -la' || lower === 'dir') {
      newEntries.push({
        type: 'output',
        text: `total 42\ndrwxr-xr-x 4 vivek staff   128 Nov 23 20:30 ./\ndrwxr-xr-x 8 root  staff   256 Nov 23 20:25 ../\n-rw-r--r-- 1 vivek staff  2.5M Nov 23 20:28 250000_viral_reels.zip\n-rw-r--r-- 1 vivek staff     0 Nov 23 20:29 passwords.txt [EMPTY - Vivek remembers in his brain]\n-rw-r--r-- 1 vivek staff    78 Nov 23 20:29 flag.txt\n-rwxr-xr-x 1 vivek staff   512 Nov 23 20:29 secret_admin_panel -> /dev/null [REDIRECTED TO HIMALAYAS 🏔️]\n-rwxr-xr-x 1 hacker staff   42 Nov 23 20:29 chai_samosa.sh`
      });
    } else if (lower === 'cat flag.txt' || lower === 'flag' || lower === 'ctf') {
      playSound('success');
      newEntries.push({
        type: 'success',
        text: `🚩 CONGRATULATIONS! You found the CTF Flag:\nFLAG{Bhai_Chai_Piyo_Reels_Banao_Hack_Karke_Kya_Milega_2026}\n\nAb is flag ka screenshot lo aur WhatsApp pe Vivek bhai ko bhejo, 10% extra discount milega!`
      });
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      } catch (e) {}
    } else if (lower.includes('password') || lower === 'cat passwords.txt') {
      playSound('denied');
      newEntries.push({
        type: 'error',
        text: `❌ [ERROR 404]: File is 0 bytes!\nBhai ne password kahin file me save hi nahi kiya. Sab dimag me lock hai. Inspect element me dhoondhna band karo! 😂`
      });
    } else if (lower === 'sudo su' || lower.includes('sudo')) {
      playSound('denied');
      newEntries.push({
        type: 'error',
        text: `[SUDO]: Password for 'guest': *********\n[ACCESS_DENIED]: Sudo access reject ho gaya bhai! Vivek bhai ko ghuskhori pasand nahi hai. Padhai karo ya reels becho! 🚫`
      });
    } else if (lower.includes('sqlmap') || lower.includes('select') || lower.includes('union') || lower.includes("' or '1'='1")) {
      newEntries.push({
        type: 'warning',
        text: `[SQLMAP v1.8.9]: Testing connection to CheapReels backend...\n[+] Backend DBMS: Cloud-Isolated / Zero-Knowledge Hash Architecture\n[!] Vulnerability Status: 0 injection points found.\n[!] Frustrated Hacker Detected: 1 (Location: Sitting with laptop & headache)\n[💡 TIP]: Ek glass thanda paani piyo dost, sehat zaroori hai.`
      });
    } else if (lower === 'rm -rf /' || lower === 'rm -rf' || lower.includes('rm -rf')) {
      playSound('denied');
      newEntries.push({
        type: 'error',
        text: `😱 ARRE BHAI BHAI BHAI! Itna gussa?! \nServer udaane chale the? Ye koi college ka practical exam thodi hai jo server uda doge! 😂 Sab safely backup hai cloud pe!`
      });
    } else if (lower === 'chai' || lower === 'tea') {
      playSound('success');
      newEntries.push({
        type: 'success',
        text: `☕ Garam adrak-elaichi cutting chai aapke table pe hazir hai! Ek ghunt lo aur socho: 'Kyun na ₹49 me reels khareed ke ek Instagram theme page khol lu?'`
      });
    } else if (lower === 'hire_me' || lower === 'hire' || lower === 'contact') {
      newEntries.push({
        type: 'output',
        text: `Opening Vivek's WhatsApp... Bhai ko seedha message bhejo: 'Bhai talent hai mujhme, website pe admin dhoondh liya tha!' 💬`
      });
      setTimeout(() => {
        if (cleanPhone) {
          window.open(`https://wa.me/${cleanPhone}?text=Bhai%20maine%20website%20pe%20/admin%20hack%20karne%20ka%20try%20kiya%20tha%20😂%20Collab%20ya%20discount%20milega?`, '_blank');
        }
      }, 800);
    } else if (lower === 'buy_reels' || lower === 'shop' || lower === 'buy') {
      newEntries.push({
        type: 'success',
        text: `Bohot badiya faisla! Asli smart banda wahi hai jo time waste na kare aur business shuru kare. Redirecting to storefront... 🚀`
      });
      setTimeout(handleReturnHome, 1000);
    } else {
      playSound('denied');
      newEntries.push({
        type: 'error',
        text: `bash: ${trimmed}: command not found. Arey bhai dhang ki command chalao! "help" type karo ya neeche chips pe click karo.`
      });
    }

    setTerminalHistory(prev => [...prev, ...newEntries]);
    setInputCommand('');
  };

  const handleChipClick = (cmd) => {
    executeCommand(cmd);
  };

  const handleCopyFlag = () => {
    try {
      navigator.clipboard.writeText('FLAG{Bhai_Chai_Piyo_Reels_Banao_Hack_Karke_Kya_Milega_2026}');
      setCopiedFlag(true);
      playSound('success');
      setTimeout(() => setCopiedFlag(false), 2500);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-2xl animate-fadeIn overflow-y-auto select-none">
      
      {/* Background Ambience Glow */}
      <div className="fixed top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Terminal Window */}
      <div className="relative w-full max-w-2xl bg-[#0d1117] border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-slate-200 overflow-hidden ring-1 ring-white/10 flex flex-col my-auto max-h-[92vh]">
        
        {/* macOS Style Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-slate-800 text-xs select-none">
          {/* Traffic lights */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleReturnHome}
              className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition cursor-pointer" 
              title="Close & Go to Home"
            />
            <button 
              onClick={() => setActiveTab('letter')}
              className="w-3 h-3 rounded-full bg-amber-500 hover:opacity-80 transition cursor-pointer" 
              title="Read Letter"
            />
            <button 
              onClick={() => setActiveTab('certificate')}
              className="w-3 h-3 rounded-full bg-emerald-500 hover:opacity-80 transition cursor-pointer" 
              title="View Certificate"
            />
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 ml-2">
              bash - 80x24 - vivek@cheapreels: ~ (honeypot decoy)
            </span>
          </div>

          {/* Sound & Close Actions */}
          <div className="flex items-center gap-2 text-slate-400">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button
              onClick={handleReturnHome}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Exit"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800/80 bg-[#0f141c] px-3 pt-2 gap-1 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition border-t border-x cursor-pointer ${
              activeTab === 'terminal'
                ? 'bg-[#0d1117] text-emerald-400 border-slate-700/80 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>terminal.sh</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          <button
            onClick={() => setActiveTab('letter')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition border-t border-x cursor-pointer ${
              activeTab === 'letter'
                ? 'bg-[#0d1117] text-amber-400 border-slate-700/80 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>bhai_ka_letter.txt</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition border-t border-x cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-[#0d1117] text-purple-400 border-slate-700/80 font-bold'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>hacker_award.md</span>
          </button>
        </div>

        {/* Tab 1: Interactive Terminal */}
        {activeTab === 'terminal' && (
          <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-hidden bg-[#0d1117] font-mono text-[11px] sm:text-xs">
            {/* Terminal Output Log */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px] scrollbar-thin scrollbar-thumb-slate-800">
              
              {/* ASCII Header Banner */}
              <div className="text-emerald-400/90 leading-tight pb-2 select-none font-bold text-[10px] sm:text-[11px]">
                {`   _____ _                          ____           _     \n  / ____| |                        |  _ \\         | |    \n | |    | |__   ___  __ _ _ __     | |_) | ___  ___| |___ \n | |    | '_ \\ / _ \\/ _\` | '_ \\    |  _ < / _ \\/ _ \\ / __|\n | |____| | | |  __/ (_| | |_) |   | |_) |  __/  __/ \\__ \\\n  \\_____|_| |_|\\___|\\__,_| .__/    |____/ \\___|\\___|_|___/\n                         | |                              \n                         |_|   [VIVEK SINGH'S HONEYPOT]`}
              </div>

              {terminalHistory.map((item, idx) => (
                <div key={idx} className="leading-relaxed">
                  {item.type === 'command' && (
                    <div className="text-slate-100 font-semibold">{item.text}</div>
                  )}
                  {item.type === 'system' && (
                    <div className="text-slate-400">{item.text}</div>
                  )}
                  {item.type === 'warning' && (
                    <div className="text-amber-400 font-medium">{item.text}</div>
                  )}
                  {item.type === 'error' && (
                    <div className="text-rose-400 whitespace-pre-wrap">{item.text}</div>
                  )}
                  {item.type === 'success' && (
                    <div className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg whitespace-pre-wrap">
                      {item.text}
                    </div>
                  )}
                  {item.type === 'output' && (
                    <div className="text-slate-300 whitespace-pre-wrap">{item.text}</div>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Quick Command Chips (For Fast Mobile / Desktop Tapping) */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-500 mr-1 select-none font-sans font-medium">Quick run:</span>
              {[
                { label: 'help', cmd: 'help' },
                { label: 'cat flag.txt', cmd: 'cat flag.txt' },
                { label: 'cat passwords.txt', cmd: 'cat passwords.txt' },
                { label: 'sudo su', cmd: 'sudo su' },
                { label: 'ls -la', cmd: 'ls -la' },
                { label: 'sqlmap', cmd: 'sqlmap' },
                { label: 'rm -rf /', cmd: 'rm -rf /' },
                { label: 'hire_me', cmd: 'hire_me' },
                { label: 'clear', cmd: 'clear' }
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleChipClick(chip.cmd)}
                  className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700/60 text-[10px] transition cursor-pointer active:scale-95"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Line Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                executeCommand(inputCommand);
              }}
              className="mt-2 flex items-center gap-2 bg-[#161b22] border border-slate-700/70 rounded-xl px-3 py-2 text-xs"
            >
              <span className="text-emerald-400 font-bold select-none whitespace-nowrap">
                guest@cheapreels:~$
              </span>
              <input
                ref={inputRef}
                type="text"
                value={inputCommand}
                onChange={(e) => setInputCommand(e.target.value)}
                placeholder="type 'help' or any command..."
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 outline-none font-mono text-xs"
                autoFocus
              />
              <button
                type="submit"
                className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
              >
                <span>Enter</span>
                <CornerDownLeft className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Bhai Ka Letter */}
        {activeTab === 'letter' && (
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[420px] bg-[#0d1117] text-slate-200 space-y-4">
            <div className="p-4 sm:p-5 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl shadow-inner">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✉️</span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-amber-300">
                      Ek Zaroori Sandesh — Vivek Singh Ki Taraf Se
                    </h3>
                    <p className="text-[10px] text-slate-400">Cheap Reels Founder • For Our Beloved Hacker Bro</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  DIL SE ❤️
                </span>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed text-slate-300 space-y-3 font-sans">
                <p>
                  <strong className="text-amber-300 text-sm">Arre Hacker Bhai! 😂</strong> Pehle toh salute hai aapki mehnat aur curiosity ko! Termux, Kali Linux, ya browser inspect element me inspect karke yahan <code className="bg-slate-800 text-amber-400 px-1 py-0.5 rounded font-mono text-xs">/admin</code> tak pohoch hi gaye!
                </p>

                <p>
                  Par sach bataun dil se? Yahan sachme kuch nahi hai dost. Na koi purana WordPress login hai, na koi PHP backdoor, aur na hi koi leaked password. Asli admin panel humne aisi jagah lock kiya hai jahan Google ke bots bhi bina passport ke nahi ja sakte!
                </p>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
                  <div className="text-emerald-400 font-bold">💡 Ek dost hone ke naate seedhi baat:</div>
                  <div>Tumhara dimaag bohot tez hai, par yahan time waste karke kya milega? Babaji ka thullu! 🧘‍♂️</div>
                  <div className="text-slate-400">Isse 100 guna behtar plan ye hai:</div>
                  <div className="text-amber-300">1. ₹49 kharch karke 10,000+ Viral Reels ka bundle lo.</div>
                  <div className="text-amber-300">2. Instagram pe ek theme page banao (Finance, AI, Motivation).</div>
                  <div className="text-amber-300">3. Roz 2-3 reels bina face dikhaye post karo.</div>
                  <div className="text-amber-300">4. 1 mahine me 50k+ followers banao aur brand promotions se kamao!</div>
                </div>

                <p>
                  Hacking me FIR aur court ke chakkar rehte hain bro, digital creator bano, apna brand banao aur chill life jiyo! Agar sach me tech pe ya partnership pe baat karni ho, toh neeche WhatsApp pe direct message kar dena, bhai hamesha reply karega!
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                  <span>Apna khayal rakhna dost! 🤝</span>
                  <span className="font-bold text-amber-400 font-mono">— Vivek Singh</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Hacker Certificate */}
        {activeTab === 'certificate' && (
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[420px] bg-[#0d1117] flex flex-col items-center justify-center">
            <div className="relative w-full max-w-lg p-6 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-dashed border-amber-400/50 rounded-2xl shadow-2xl text-center space-y-3">
              
              {/* Certificate Seal Badge */}
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-2xl shadow-lg ring-4 ring-amber-500/20">
                🏅
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-black">
                  Official Recognition of Hard Work
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  SASTA MR. ROBOT AWARD 🕶️
                </h3>
              </div>

              <p className="text-xs text-slate-300 font-sans max-w-sm mx-auto">
                This prestigious participation award is happily presented to our dear visitor:
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500">Hacker Identity: </span>
                  <strong className="text-amber-300">Mr. Anonymous 🕵️‍♂️ (Secret Bro)</strong>
                </div>
                <div>
                  <span className="text-slate-500">Crime Attempted: </span>
                  <span className="text-rose-400 font-bold">Hacking a ₹49 website at 2 AM</span>
                </div>
                <div>
                  <span className="text-slate-500">Result: </span>
                  <span className="text-emerald-400 font-bold">100% Mehnat, 0% Backend Access 😂</span>
                </div>
                <div>
                  <span className="text-slate-500">Verdict: </span>
                  <span className="text-slate-200">Banda talented hai, bas galat jagah energy laga raha hai!</span>
                </div>
              </div>

              {/* CTF Flag Box */}
              <div className="pt-1">
                <div className="flex items-center justify-between p-2 bg-slate-900/90 rounded-lg border border-slate-800 text-[11px] font-mono">
                  <span className="text-slate-400 truncate mr-2">
                    FLAG: FLAG&#123;Bhai_Chai_Piyo_Reels_Banao...&#125;
                  </span>
                  <button
                    onClick={handleCopyFlag}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded flex items-center gap-1 transition text-[10px] font-bold cursor-pointer"
                  >
                    {copiedFlag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFlag ? 'Copied!' : 'Copy Flag'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-sans">
                <span>Verified by: Cheap Reels Honeypot</span>
                <span className="font-bold text-amber-400 font-mono">Signed: Vivek Singh ✍️</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Footer Bar */}
        <div className="p-3 sm:p-4 bg-[#161b22] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 select-none">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Cheap Reels Store • Vivek Singh</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* WhatsApp Link */}
            <a
              href={cleanPhone ? `https://wa.me/${cleanPhone}?text=Bhai%20maine%20website%20pe%20/admin%20hack%20karne%20ka%20try%20kiya%20tha%20😂%20Collab%20ya%20discount%20milega?` : '#'}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bhai Se WhatsApp Pe Baat Karo</span>
            </a>

            {/* Back to Storefront */}
            <button
              onClick={handleReturnHome}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Chalo Reels Khareedo (₹49)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
