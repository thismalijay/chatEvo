import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Challenge, Conversation, LiveReq, ModeId, Msg, NudgeKey, Prefs, View } from '../lib/types';
import { KEYS, clearAll, defaultPrefs, load, save, uid } from '../lib/storage';
import { addImpacts, computeImpact, conversationTokens, estimateTokens } from '../lib/energy';
import { makeTitle, mockReply, summarize } from '../lib/mock';
import { taskType } from '../lib/router';
import { CHALLENGES, THREAD_SLOGAN, THREAD_TOPIC } from '../data/demoData';
import { APP_VERSION } from '../config';

const REPLY_DELAY = 650;

/** Construit une conversation pré-remplie (impacts calculés avec l'historique croissant). */
export function buildThread(id: string, title: string, pairs: [string, string][], ageMs = 3600_000): Conversation {
  const messages: Msg[] = [];
  let history = 0;
  pairs.forEach(([u, a], i) => {
    messages.push({ id: `${id}-u${i}`, role: 'user', text: u });
    const impact = computeImpact('rapide', history, estimateTokens(u), estimateTokens(a));
    messages.push({ id: `${id}-a${i}`, role: 'assistant', text: a, mode: 'rapide', impact, variant: 0 });
    history += estimateTokens(u) + estimateTokens(a);
  });
  return { id, title, createdAt: Date.now() - ageMs, messages };
}
const topicThread = () => buildThread('demo-sujet', 'Exposé sur la sobriété numérique', THREAD_TOPIC);
const sloganThread = () => buildThread('demo-slogan', 'Slogan des Jardins partagés', THREAD_SLOGAN, 7200_000);

export const SCENARIOS = [
  { n: 1, label: 'Question simple', text: "Quelle est la capitale de l'Australie ?" },
  { n: 2, label: 'Question complexe', text: 'Compare les théories UTAUT et TAM et analyse leurs limites' },
  { n: 3, label: "Conversion d'unités", text: 'Combien font 250 g en tasses ?' },
  { n: 4, label: 'Changement de sujet', text: 'Au fait, tu as une recette rapide avec des lentilles ?' },
  { n: 5, label: 'Régénération', text: '' },
] as const;

interface SendOpts {
  replaceLastPair?: boolean;
  forceNew?: boolean;
  mode?: ModeId;
  hadTool?: boolean;
}

function useAppState() {
  const [prefs, setPrefs] = useState<Prefs>(() => load(KEYS.prefs, defaultPrefs));
  const [convs, setConvs] = useState<Conversation[]>(() => load<Conversation[]>(KEYS.convs, [topicThread(), sloganThread()]));
  const [challenges, setChallenges] = useState<Challenge[]>(() => load<Challenge[]>(KEYS.challenges, CHALLENGES));
  const [live, setLive] = useState<LiveReq[]>(() => load<LiveReq[]>(KEYS.live, []));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setViewState] = useState<View>('chat');
  const [draft, setDraft] = useState('');
  const [mode, setModeState] = useState<ModeId>(() => load(KEYS.prefs, defaultPrefs).defaultMode);
  const [manual, setManual] = useState(false); // l'utilisateur a choisi le mode lui-même pour ce message
  const [routedFrom, setRoutedFrom] = useState<ModeId | null>(null);
  const [pending, setPending] = useState(false);
  const [lastSendHadTool, setLastSendHadTool] = useState(false); // « jamais deux fois d'affilée »
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const forced = new URLSearchParams(window.location.search).has('accueil');
    if (forced) window.history.replaceState(null, '', window.location.pathname);
    return forced || load(KEYS.prefs, defaultPrefs).onboardedVersion !== APP_VERSION;
  });
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [methodOpen, setMethodOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);

  useEffect(() => save(KEYS.prefs, prefs), [prefs]);
  useEffect(() => save(KEYS.convs, convs), [convs]);
  useEffect(() => save(KEYS.challenges, challenges), [challenges]);
  useEffect(() => save(KEYS.live, live), [live]);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Ambiances : Mon usage et Défis sont toujours en mode sombre « dashboard ».
  const chatDark = prefs.theme === 'sombre' || (prefs.theme === 'auto' && systemDark);
  const dark = view === 'usage' || view === 'defis' ? true : chatDark;

  const active = convs.find((c) => c.id === activeId) ?? null;

  const updatePrefs = useCallback((p: Partial<Prefs>) => setPrefs((prev) => ({ ...prev, ...p })), []);
  const setNudge = (k: NudgeKey, v: boolean) => setPrefs((prev) => ({ ...prev, nudges: { ...prev.nudges, [k]: v } }));
  const setMode = useCallback((m: ModeId, isManual = true) => {
    setModeState(m);
    if (isManual) {
      setManual(true);
      setRoutedFrom(null);
    }
  }, []);

  const resetComposer = () => {
    setDraft('');
    setModeState(prefs.defaultMode);
    setManual(false);
    setRoutedFrom(null);
  };

  const setView = (v: View) => {
    setViewState(v);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  function reply(convId: string, userText: string, m: ModeId, historyTokens: number, o: { variant: number; expanded: boolean; routedFrom?: ModeId }) {
    setPending(true);
    window.setTimeout(() => {
      const text = mockReply(userText, m, o.expanded, o.variant);
      const impact = computeImpact(m, historyTokens, estimateTokens(userText), estimateTokens(text));
      const msg: Msg = { id: uid(), role: 'assistant', text, mode: m, impact, variant: o.variant, expanded: o.expanded || m === 'approfondi', routedFrom: o.routedFrom };
      setConvs((cs) => cs.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c)));
      setLive((l) => [...l, { t: Date.now(), wh: impact.wh, mode: m, task: taskType(userText) }]);
      setPending(false);
    }, REPLY_DELAY);
  }

  function send(raw: string, opts: SendOpts = {}) {
    const text = raw.trim();
    if (!text || pending) return;
    let conv = opts.forceNew ? null : active;
    let base = conv?.messages ?? [];
    if (opts.replaceLastPair) base = base.slice(0, -2);
    if (!conv) {
      const created: Conversation = { id: uid(), title: makeTitle(text), createdAt: Date.now(), messages: [] };
      setConvs((cs) => [created, ...cs]);
      setActiveId(created.id);
      conv = created;
      base = [];
    }
    const history = conversationTokens({ messages: base, summary: conv.summary });
    const id = conv.id;
    const userMsg: Msg = { id: uid(), role: 'user', text };
    setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, messages: [...base, userMsg] } : c)));
    const m = opts.mode ?? mode;
    const from = routedFrom ?? undefined;
    setLastSendHadTool(!!opts.hadTool);
    resetComposer();
    reply(id, text, m, history, { variant: 0, expanded: !prefs.shortAnswers, routedFrom: from });
  }

  /** Feature 6 : « Développer » remplace la réponse courte par la version détaillée (coût ajouté à la note). */
  function expand(msgId: string) {
    if (!active || pending) return;
    const idx = active.messages.findIndex((m) => m.id === msgId);
    const msg = active.messages[idx];
    const user = active.messages[idx - 1];
    if (!msg?.mode || !msg.impact || !user || msg.expanded) return;
    const long = mockReply(user.text, msg.mode, true, msg.variant ?? 0);
    const history = conversationTokens({ messages: active.messages.slice(0, idx + 1), summary: active.summary });
    const extra = computeImpact(msg.mode, history, 4, estimateTokens(long));
    const impact = addImpacts(msg.impact, extra);
    const convId = active.id;
    const m = msg.mode;
    setPending(true);
    window.setTimeout(() => {
      setConvs((cs) => cs.map((c) => (c.id === convId ? { ...c, messages: c.messages.map((x) => (x.id === msgId ? { ...x, text: long, expanded: true, impact } : x)) } : c)));
      setLive((l) => [...l, { t: Date.now(), wh: extra.wh, mode: m, task: taskType(user.text) }]);
      setPending(false);
    }, 500);
  }

  function regenerate() {
    if (!active || pending) return;
    const msgs = active.messages;
    const a = msgs[msgs.length - 1];
    const u = msgs[msgs.length - 2];
    if (a?.role !== 'assistant' || u?.role !== 'user') return;
    const history = conversationTokens({ messages: msgs.slice(0, -2), summary: active.summary });
    const convId = active.id;
    setConvs((cs) => cs.map((c) => (c.id === convId ? { ...c, messages: c.messages.slice(0, -1) } : c)));
    reply(convId, u.text, a.mode ?? 'rapide', history, { variant: (a.variant ?? 0) + 1, expanded: !!a.expanded && a.mode !== 'approfondi' });
  }

  /** Feature 5 : nouvelle conversation (avec résumé si demandé), la suggestion ne réapparaît pas. */
  function newConversation(opts: { withSummary?: boolean; keepDraft?: boolean } = {}) {
    const prev = active;
    if (prev) setConvs((cs) => cs.map((c) => (c.id === prev.id ? { ...c, newConvHintShown: true } : c)));
    const kept = opts.keepDraft ? draft : '';
    if (opts.withSummary && prev) {
      const conv: Conversation = { id: uid(), title: makeTitle('Suite : ' + prev.title.replace(/^Suite : /, '')), createdAt: Date.now(), messages: [], summary: summarize(prev) };
      setConvs((cs) => [conv, ...cs]);
      setActiveId(conv.id);
    } else {
      setActiveId(null);
    }
    resetComposer();
    setDraft(kept);
    setViewState('chat');
  }

  const dismissNewConvHint = () => {
    if (active) {
      const id = active.id;
      setConvs((cs) => cs.map((c) => (c.id === id ? { ...c, newConvHintShown: true } : c)));
    }
  };

  const openConv = (id: string | null) => {
    setActiveId(id);
    resetComposer();
    setView('chat');
  };

  /** Les 5 scénarios prédéfinis (rejouables). */
  function runScenario(n: number, autoSend = false) {
    setShowOnboarding(false);
    setViewState('chat');
    const s = SCENARIOS.find((x) => x.n === n);
    if (!s) return;
    if (n === 4) {
      const t = topicThread();
      setConvs((cs) => [t, ...cs.filter((c) => c.id !== t.id)]);
      setActiveId(t.id);
      resetComposer();
      setDraft(s.text);
      return;
    }
    if (n === 5) {
      const t = sloganThread();
      setConvs((cs) => [t, ...cs.filter((c) => c.id !== t.id)]);
      setActiveId(t.id);
      resetComposer();
      setPrefs((p) => ({ ...p, regenNoticeSeen: false, nudges: { ...p.nudges, regenNotice: true } }));
      return;
    }
    if (n === 3) setLastSendHadTool(false);
    setActiveId(null);
    resetComposer();
    if (autoSend) send(s.text, { forceNew: true, mode: 'rapide' });
    else setDraft(s.text);
  }

  const updateChallenge = (id: string, patch: Partial<Challenge>) => setChallenges((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const createChallenge = (c: Challenge) => setChallenges((cs) => [c, ...cs]);

  function finishOnboarding(p: Partial<Prefs>) {
    setPrefs((prev) => ({ ...prev, ...p, onboardedVersion: APP_VERSION }));
    if (p.defaultMode) setModeState(p.defaultMode);
    setShowOnboarding(false);
  }

  function resetAll() {
    clearAll();
    window.location.href = window.location.pathname + '?accueil';
  }

  return {
    prefs, updatePrefs, setNudge,
    convs, active, activeId, openConv,
    view, setView, dark, chatDark,
    draft, setDraft, mode, setMode, manual, routedFrom, setRoutedFrom,
    pending, send, expand, regenerate, newConversation, dismissNewConvHint,
    lastSendHadTool, live,
    challenges, updateChallenge, createChallenge,
    showOnboarding, setShowOnboarding, finishOnboarding,
    demoOpen, setDemoOpen, demoStep, setDemoStep, runScenario,
    methodOpen, setMethodOpen, sidebarOpen, setSidebarOpen, resetAll,
  };
}

export type AppState = ReturnType<typeof useAppState>;
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return c;
}
