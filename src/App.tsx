import './App.css';
import BeefreeEditor from './BeefreeEditor';

function DocsButton() {
  return (
    <a
      href="https://docs.beefree.io/beefree-sdk"
      target="_blank"
      rel="noopener noreferrer"
    >
      <button style={{ padding: '10px 20px', fontSize: '16px' }}>
        Read the Docs
      </button>
    </a>
  );
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to My Beefree Demo</h1>
        <DocsButton />
        <BeefreeEditor />
      </header>
    </div>
  );
}

export default App;
