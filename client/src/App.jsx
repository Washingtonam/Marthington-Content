import ContentDisplay from './components/ContentDisplay';
import ContentGenerator from './components/ContentGenerator';

function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <section className="mb-12 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-400">Finance & Tech Publishing</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Affiliate Content Factory</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            A reader-friendly experience for showcasing high-quality affiliate-driven content across multiple verticals.
          </p>
        </section>

        <div className="mb-10">
          <ContentGenerator />
        </div>

        <ContentDisplay />
      </div>
    </main>
  );
}

export default App;
