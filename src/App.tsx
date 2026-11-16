import { useApp } from './state/store';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ChatScreen } from './components/chat/ChatScreen';
import { UsagePage } from './components/usage/UsagePage';
import { ChallengesPage } from './components/challenges/ChallengesPage';
import { SettingsPage } from './components/SettingsPage';
import { Onboarding } from './components/Onboarding';
import { GuidedDemo } from './components/GuidedDemo';
import { MethodDialog } from './components/MethodDialog';

/** Racine : la classe `dark` bascule l'ambiance (clair « éditorial » / sombre « dashboard »). */
export default function App() {
  const app = useApp();
  return (
    <div className={`${app.dark ? 'dark' : ''} h-full`}>
      <div className="flex h-full bg-bg text-ink transition-colors duration-300">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Header />
          {app.view === 'chat' && <ChatScreen />}
          {app.view === 'usage' && <UsagePage />}
          {app.view === 'defis' && <ChallengesPage />}
          {app.view === 'reglages' && <SettingsPage />}
        </main>
      </div>
      {app.showOnboarding && <Onboarding />}
      {app.demoOpen && <GuidedDemo />}
      {app.methodOpen && <MethodDialog />}
    </div>
  );
}
