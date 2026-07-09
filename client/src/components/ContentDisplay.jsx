import { useEffect, useState } from 'react';

function ContentDisplay() {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');

        if (!response.ok) {
          throw new Error('Unable to load content at the moment.');
        }

        const data = await response.json();

        if (isMounted) {
          setContentItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Something went wrong while loading content.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-300 shadow-xl">
        <p className="text-lg font-medium">Loading curated insights…</p>
        <p className="mt-2 text-sm text-slate-400">Preparing your latest finance and tech content.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-800/60 bg-rose-950/40 p-8 text-center text-rose-200 shadow-xl">
        <p className="text-lg font-medium">We could not load the content right now.</p>
        <p className="mt-2 text-sm text-rose-200/80">{error}</p>
      </div>
    );
  }

  if (!contentItems.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-300 shadow-xl">
        <p className="text-lg font-medium">No content has been published yet.</p>
        <p className="mt-2 text-sm text-slate-400">Create a new item from the backend to see it here.</p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {contentItems.map((item) => (
        <article
          key={item._id || item.id}
          className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl"
        >
          <div className="border-b border-slate-800 bg-slate-950/70 px-8 py-7">
            <div className="flex flex-wrap items-center gap-3 text-sm text-cyan-400">
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1">{item.vertical}</span>
              <span className="text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'New'}</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{item.title}</h2>
          </div>

          <div className="space-y-6 px-8 py-8 text-slate-300">
            <div className="prose prose-invert max-w-none prose-p:leading-8 prose-p:text-slate-300">
              <p className="whitespace-pre-wrap text-base leading-8">{item.contentBody}</p>
            </div>

            {item.affiliateLinks?.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  Recommended resources
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {item.affiliateLinks.map((link, index) => (
                    <a
                      key={`${link.label}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}

export default ContentDisplay;
