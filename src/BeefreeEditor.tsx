import { useEffect, useState } from 'react';
import { Builder, useBuilder } from '@beefree.io/react-email-builder';
import type { IBeeConfig, IEntityContentJson, IToken, BeePluginError } from '@beefree.io/react-email-builder';

const BLANK_TEMPLATE: IEntityContentJson = {
  comments: {},
  page: {} as IEntityContentJson['page'],
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function BeefreeEditor() {
  // Curious if it should be undefined or null, but null is the default and what the docs use.
  const [token, setToken] = useState<IToken | null>(null);

  // Developer-facing output captured from the Beefree save flow.
  const [savedJson, setSavedJson] = useState<string | null>(null);
  const [savedHtml, setSavedHtml] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const config: IBeeConfig = {
    uid: 'demo-user',
    container: 'beefree-sdk-builder',
    language: 'en-US',
  };

  const { id, save, preview, saveAsTemplate, load } = useBuilder(config);

  async function handleSave() {
    // Guard against the editor not being ready yet (missing instance).
    if (typeof save !== 'function') {
      setSaveStatus('error');
      setSaveError('Editor is not ready yet — no save method available.');
      return;
    }
    setSaveStatus('saving');
    setSaveError(null);
    try {
      // Triggers the editor save, which fires the onSave callback below.
      await save();
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Save failed.');
    }
  }

  useEffect(() => {
    async function fetchToken() {
      const response = await fetch('http://localhost:3001/proxy/bee-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: 'demo-user' }),
      });
      const tokenData = await response.json();
      setToken(tokenData);
    }
    fetchToken();
  }, []);

  function onSave(pageJson: string, pageHtml: string) {
    console.log('Saved!', { pageJson, pageHtml });
    // pageHtml is provided by the onSave callback, so no server-side
    // (Content Services API) export is needed for this feature.
    setSavedJson(pageJson ?? null);
    setSavedHtml(pageHtml ?? null);
    setLastSavedAt(new Date().toISOString());
    setSaveStatus('saved');
    setSaveError(null);
  }

  // function onSaveAsTemplate(pageJson: string) {
  //   console.log('Template saved!', pageJson);
  // }

  function onError(error: BeePluginError) {
    console.error('Error:', error);
    setSaveStatus('error');
    setSaveError(error?.message ?? 'Beefree editor reported an error.');
  }

  if (!token) return <div>Loading editor...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => preview()}>Preview</button>
        <button onClick={handleSave}>Save</button>
        {/* Todo: fix this non working button. */}
        {/* <button onClick={() => saveAsTemplate()}>Save as Template</button> */}
      </div>
      <Builder
        id={id}
        token={token}
        template={BLANK_TEMPLATE}
        height="600px"
        onLoad={() => console.log('Builder is ready')}
        onSave={onSave}
        // onSaveAsTemplate={onSaveAsTemplate}
        onError={onError}
      />
      <DeveloperOutput
        status={saveStatus}
        lastSavedAt={lastSavedAt}
        json={savedJson}
        html={savedHtml}
        error={saveError}
      />
    </div>
  );
}

interface DeveloperOutputProps {
  status: SaveStatus;
  lastSavedAt: string | null;
  json: string | null;
  html: string | null;
  error: string | null;
}

function DeveloperOutput({ status, lastSavedAt, json, html, error }: DeveloperOutputProps) {
  const htmlSnippet = html ? html.slice(0, 300) : null;

  return (
    <div
      style={{
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        border: '1px solid #ccc',
        borderRadius: 6,
        fontFamily: 'monospace',
        fontSize: 13,
        textAlign: 'left',
        background: '#f6f8fa',
        color: '#222',
      }}
    >
      <strong>Developer Output</strong>
      <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
        <li>Save status: {status}</li>
        <li>Last saved: {lastSavedAt ?? '—'}</li>
        <li>JSON captured: {json ? `yes (${json.length} chars)` : 'no'}</li>
        <li>HTML captured: {html ? `yes (${html.length} chars)` : 'no'}</li>
      </ul>
      {error && <div style={{ color: '#b00020' }}>Error: {error}</div>}
      {htmlSnippet && (
        <details style={{ marginTop: '0.5rem' }}>
          <summary>HTML preview (truncated)</summary>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: '0.5rem 0 0',
            }}
          >
            {htmlSnippet}
            {html && html.length > 300 ? '…' : ''}
          </pre>
        </details>
      )}
    </div>
  );
}
