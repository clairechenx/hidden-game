import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-title-block">
          <h1 className="header-title">Encrypted Quest Board</h1>
          <p className="header-subtitle">Complete five confidential tasks and stack COIN rewards.</p>
        </div>
        <ConnectButton />
      </div>
    </header>
  );
}
