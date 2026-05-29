import { useEffect, useState } from 'react';
import { Builder, useBuilder } from '@beefree.io/react-email-builder';
import type { IBeeConfig, IEntityContentJson, IToken } from '@beefree.io/react-email-builder';

const BLANK_TEMPLATE: IEntityContentJson = {
  comments: {},
  page: {} as IEntityContentJson['page'],
};

export default function BeefreeEditor() {
  const [token, setToken] = useState<IToken | null>(null);

  const config: IBeeConfig = {
    uid: 'demo-user',
    container: 'beefree-sdk-builder',
    language: 'en-US',
  };

  const { id, save, preview, saveAsTemplate, load } = useBuilder(config);

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

  if (!token) return <div>Loading editor...</div>;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => preview()}>Preview</button>
        <button onClick={() => save()}>Save</button>
        <button onClick={() => saveAsTemplate()}>Save as Template</button>
      </div>
      <Builder
        id={id}
        token={token}
        template={BLANK_TEMPLATE}
        onLoad={() => console.log('Builder is ready')}
        onSave={(pageJson: string, pageHtml: string) => {
          console.log('Saved!', { pageJson, pageHtml });
        }}
        onSaveAsTemplate={(pageJson: string) => {
          console.log('Template saved!', pageJson);
        }}
        onError={(error) => {
          console.error('Error:', error);
        }}
      />
    </div>
  );
}
