import { useState } from 'react';

const services = ['BMS', 'NIMC', 'CAC', 'NPC', 'EFCC', 'Affiliate Program'];
const tones = ['Professional', 'Urgent', 'Educational', 'Story-driven'];
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function ContentGenerator() {
  const [service, setService] = useState(services[0]);
  const [tone, setTone] = useState(tones[0]);
  const [details, setDetails] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [refinementInput, setRefinementInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPost('');
    setCopied(false);

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          tone,
          extraDetails: details
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to generate the post right now.');
      }

      setGeneratedPost(data.content || data.generatedText || data.post || '');
    } catch (error) {
      console.error('Generation failed:', error);

      const contextText = details.trim()
        ? `Additional context: ${details.trim()}`
        : 'Focused on clarity, trust, and a strong call to action.';

      const fallbackPost = `Marthington Synergy Solutions\n\nService: ${service}\nTone: ${tone}\n\n${contextText}\n\nWe are helping people take the next step with ${service} in a clear, credible, and results-focused way. This message is tailored to spark interest, build confidence, and encourage action.\n\nIf you are ready to move forward, reach out today and let us help you get started.\n\n#MarthingtonSynergySolutions #${service.replace(/\s+/g, '')}`;

      setGeneratedPost(fallbackPost);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!generatedPost) return;

    setIsRefining(true);

    try {
      const response = await fetch(`${API_BASE}/content/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPost: generatedPost,
          refinementInstructions: refinementInput.trim() || 'Make this post more polished and concise.'
        })
      });

      if (!response.ok) {
        throw new Error('Unable to refine the post right now.');
      }

      const data = await response.json();
      setGeneratedPost(data.refinedText || data.refinedContent || generatedPost);
      setRefinementInput('');
    } catch (error) {
      console.error('Refinement failed:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedPost) return;

    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Unable to copy content:', error);
    }
  };

  const handleClear = () => {
    setGeneratedPost('');
    setRefinementInput('');
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Private Content Engine</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Generate social-ready posts in minutes</h2>
        </div>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
          Admin module
        </span>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <label className="block text-sm font-medium text-slate-300">
            <span className="mb-2 block">Service</span>
            <select
              value={service}
              onChange={(event) => setService(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0"
            >
              {services.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            <span className="mb-2 block">Tone</span>
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0"
            >
              {tones.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            <span className="mb-2 block">Extra details / context</span>
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={6}
              placeholder="Add a target audience, a campaign angle, or a special note for the post..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none ring-0"
            />
          </label>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isGenerating ? 'Generating your post...' : 'Generate Post'}
          </button>
        </div>

        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Generated Content</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!generatedPost || isGenerating || isRefining}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? 'Copied!' : 'Copy Post'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={!generatedPost && !refinementInput}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-rose-500 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear Workspace
              </button>
            </div>
          </div>

          <textarea
            value={generatedPost}
            readOnly
            rows={14}
            placeholder="Your generated social post will appear here."
            className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm leading-7 text-slate-200 outline-none"
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={refinementInput}
              onChange={(event) => setRefinementInput(event.target.value)}
              placeholder="Ask the assistant to modify this post... (e.g., add emojis, make it shorter)"
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
            />
            <button
              type="button"
              onClick={handleRefine}
              disabled={!generatedPost || isRefining}
              className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRefining ? 'Refining...' : 'Refine'}
            </button>
          </div>

          {isRefining && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/70 backdrop-blur-sm">
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 px-4 py-3 text-sm text-cyan-300">
                Assistant is refining your content...
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContentGenerator;
