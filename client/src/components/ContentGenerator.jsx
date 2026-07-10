import { useEffect, useState } from 'react';

const services = ['BMS', 'NIMC', 'CAC', 'NPC', 'EFCC', 'Affiliate Program'];
const tones = ['Professional', 'Urgent', 'Educational', 'Story-driven'];
const API_BASE = import.meta.env.VITE_API_URL || '/api';

function ContentGenerator() {
  const [service, setService] = useState(services[0]);
  const [tone, setTone] = useState(tones[0]);
  const [details, setDetails] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [generatedContentItemId, setGeneratedContentItemId] = useState('');
  const [refinementInput, setRefinementInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [facebookAccounts, setFacebookAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountName, setAccountName] = useState('');
  const [pageId, setPageId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [editingAccountId, setEditingAccountId] = useState('');
  const [editAccountName, setEditAccountName] = useState('');
  const [editPageId, setEditPageId] = useState('');
  const [editAccessToken, setEditAccessToken] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPost('');
    setCopied(false);

    try {
      const response = await fetch(`${API_BASE}/content/generate`, {
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
      setGeneratedContentItemId(data.contentItem?._id || data.savedId || '');
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

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await fetch(`${API_BASE}/facebook-accounts`);
        const data = await response.json().catch(() => []);

        if (Array.isArray(data)) {
          setFacebookAccounts(data);
          if (data[0]?._id) {
            setSelectedAccountId(data[0]._id);
          }
        }
      } catch (error) {
        console.error('Failed to load Facebook accounts:', error);
      }
    };

    loadAccounts();
  }, []);

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
    setGeneratedContentItemId('');
    setRefinementInput('');
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_BASE}/content/social-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountName,
          pageId,
          accessToken
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to save the account.');
      }

      setFacebookAccounts((current) => [data, ...current]);
      setSelectedAccountId(data._id);
      setAccountName('');
      setPageId('');
      setAccessToken('');
      setAccountMessage(`Saved ${data.name} for Facebook publishing.`);
    } catch (error) {
      console.error('Account save failed:', error);
      setAccountMessage(error.message || 'Unable to save the account.');
    }
  };

  const handleStartEdit = (account) => {
    setEditingAccountId(account._id);
    setEditAccountName(account.name || '');
    setEditPageId(account.pageId || '');
    setEditAccessToken(account.accessToken || '');
    setEditIsActive(account.isActive !== false);
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editingAccountId) return;

    try {
      const response = await fetch(`${API_BASE}/content/social-accounts/${editingAccountId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editAccountName,
          pageId: editPageId,
          accessToken: editAccessToken,
          isActive: editIsActive
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to update the account.');
      }

      setAdminAccounts((current) => current.map((account) => account._id === editingAccountId ? data : account));
      setEditingAccountId('');
      setAccountMessage(`Updated ${data.name}.`);
    } catch (error) {
      console.error('Account update failed:', error);
      setAccountMessage(error.message || 'Unable to update the account.');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      const response = await fetch(`${API_BASE}/content/social-accounts/${accountId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Unable to delete the account.');
      }

      setAdminAccounts((current) => current.filter((account) => account._id !== accountId));
      setFacebookAccounts((current) => current.filter((account) => account._id !== accountId));
      if (selectedAccountId === accountId) {
        setSelectedAccountId('');
      }
      setAccountMessage('Account deleted successfully.');
    } catch (error) {
      console.error('Account delete failed:', error);
      setAccountMessage(error.message || 'Unable to delete the account.');
    }
  };

  const handlePublish = async () => {
    if (!generatedContentItemId || !selectedAccountId) return;

    setIsPublishing(true);

    try {
      const response = await fetch(`${API_BASE}/content/facebook/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentItemId: generatedContentItemId,
          facebookAccountId: selectedAccountId
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to publish to Facebook.');
      }

      setAccountMessage(`Published successfully to ${data.account?.name || 'Facebook'}.`);
    } catch (error) {
      console.error('Publish failed:', error);
      setAccountMessage(error.message || 'Unable to publish to Facebook.');
    } finally {
      setIsPublishing(false);
    }
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

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <label className="mb-3 block text-sm text-slate-300">
              <span className="mb-2 block">Select Target Facebook Page</span>
              <select
                value={selectedAccountId}
                onChange={(event) => setSelectedAccountId(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                {facebookAccounts.length === 0 ? (
                  <option value="">No pages available</option>
                ) : (
                  facebookAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.pageName} ({account.fbPageId})
                    </option>
                  ))
                )}
              </select>
            </label>

            {selectedAccountId && facebookAccounts.find((account) => account._id === selectedAccountId) ? (
              <p className="text-sm text-cyan-300">
                Selected: {facebookAccounts.find((account) => account._id === selectedAccountId)?.pageName}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Publish destination</h3>
              <span className="text-xs text-slate-400">Saved in MongoDB</span>
            </div>

            <label className="mb-3 block text-sm text-slate-300">
              <span className="mb-2 block">Select account</span>
              <select
                value={selectedAccountId}
                onChange={(event) => setSelectedAccountId(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none"
              >
                {accounts.length === 0 ? (
                  <option value="">No accounts saved yet</option>
                ) : (
                  accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} ({account.pageId})
                    </option>
                  ))
                )}
              </select>
            </label>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <input
                type="text"
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="Account name"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
              />
              <input
                type="text"
                value={pageId}
                onChange={(event) => setPageId(event.target.value)}
                placeholder="Facebook Page ID"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
              />
              <input
                type="password"
                value={accessToken}
                onChange={(event) => setAccessToken(event.target.value)}
                placeholder="Page access token"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Save Facebook account
              </button>
            </form>

            {accountMessage ? (
              <p className="mt-3 text-sm text-slate-400">{accountMessage}</p>
            ) : null}

            {selectedAccountId && accounts.find((account) => account._id === selectedAccountId) ? (
              <p className="mt-3 text-sm text-cyan-300">
                Selected: {accounts.find((account) => account._id === selectedAccountId)?.name}
              </p>
            ) : null}
          </div>
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
              <button
                type="button"
                onClick={handlePublish}
                disabled={!generatedContentItemId || isPublishing || !selectedAccountId}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Publish to Facebook'}
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

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Admin dashboard</h3>
            <p className="text-sm text-slate-400">Manage saved Facebook accounts and their publishing credentials.</p>
          </div>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">
            Multi-page ready
          </span>
        </div>

        <div className="space-y-4">
          {adminAccounts.length === 0 ? (
            <p className="text-sm text-slate-400">No Facebook accounts saved yet.</p>
          ) : (
            adminAccounts.map((account) => (
              <div key={account._id} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                {editingAccountId === account._id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3">
                    <input
                      type="text"
                      value={editAccountName}
                      onChange={(event) => setEditAccountName(event.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      value={editPageId}
                      onChange={(event) => setEditPageId(event.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
                    />
                    <input
                      type="password"
                      value={editAccessToken}
                      onChange={(event) => setEditAccessToken(event.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none"
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={editIsActive}
                        onChange={(event) => setEditIsActive(event.target.checked)}
                      />
                      Active
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">Save</button>
                      <button type="button" onClick={() => setEditingAccountId('')} className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-white">{account.name}</p>
                      <p className="text-sm text-slate-400">Page ID: {account.pageId}</p>
                      <p className="text-sm text-slate-400">Status: {account.isActive === false ? 'Inactive' : 'Active'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleStartEdit(account)} className="rounded-2xl border border-slate-700 px-3 py-2 text-sm text-slate-300">Edit</button>
                      <button type="button" onClick={() => handleDeleteAccount(account._id)} className="rounded-2xl border border-rose-500/30 px-3 py-2 text-sm text-rose-300">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ContentGenerator;
