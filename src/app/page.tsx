export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-950 to-slate-900 text-white font-sans">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500">
            Podcast AI Agent
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            Profi rešerše hostů přímo do tvého WhatsAppu.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 mt-12">
          <div className="p-8 bg-white/5 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl text-left hover:border-white/20 transition-all">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">🚀</span>
              Jak to funguje?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-emerald-400 mt-1">1</div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-200">Napiš na WhatsApp</h3>
                  <p className="text-slate-400">Pošli jméno jakéhokoliv hosta (např. &quot;Petr Mára&quot; nebo &quot;Elon Musk&quot;).</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-emerald-400 mt-1">2</div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-200">Agent jde do akce</h3>
                  <p className="text-slate-400">Gemini 1.5 Pro prohledá aktuální články, rozhovory a sociální sítě.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-emerald-400 mt-1">3</div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-slate-200">Dostaneš PDF Briefing</h3>
                  <p className="text-slate-400">Během chvíle ti zpět přijde strukturované PDF s Bio, otázkami a zajímavostmi.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
              <p className="text-emerald-400 font-bold">Ukázka pro tým Vojty Žižky</p>
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
          <span>Next.js 16</span>
          <span className="text-slate-700">•</span>
          <span>Gemini 1.5</span>
          <span className="text-slate-700">•</span>
          <span>Twilio</span>
          <span className="text-slate-700">•</span>
          <span>Prisma 7</span>
        </div>
      </div>
    </main>
  );
}
