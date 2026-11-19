import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { UNITS, getChallenge } from '../content/curriculum';
import {
  completeSession,
  findLesson,
  freshProgress,
  isUnlocked,
  type CompletionResult,
  type Progress,
} from '../engine/progress';
import { newId } from '../engine/random';
import { buildReviewQueue } from '../engine/review';
import { normalizeOnResume, startSession, type Session } from '../engine/session';
import { LocalProgressRepository, type ProgressRepository } from '../engine/storage';

export type Notice = { tone: 'info' | 'warn'; text: string } | null;

interface Store {
  progress: Progress;
  notice: Notice;
  storageAvailable: boolean;
  lastResult: CompletionResult | null;
  setNotice: (n: Notice) => void;
  /** Start or resume a lesson/review. Returns null if it isn't allowed. */
  openSession: (target: string) => Session | null;
  updateSession: (s: Session) => void;
  finishSession: (s: Session) => CompletionResult | null;
  updateProfile: (patch: Partial<Progress['profile']>) => void;
  updateSettings: (patch: Partial<Progress['settings']>) => void;
  resetAll: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({
  children,
  repository,
  now = () => new Date(),
}: {
  children: ReactNode;
  repository?: ProgressRepository & { available?: boolean };
  now?: () => Date;
}) {
  const repo = useMemo(() => repository ?? new LocalProgressRepository(), [repository]);
  const initial = useMemo(() => repo.load(now()), [repo]); // eslint-disable-line react-hooks/exhaustive-deps
  const [progress, setProgress] = useState<Progress>(initial.progress);
  const [lastResult, setLastResult] = useState<CompletionResult | null>(null);
  const [notice, setNotice] = useState<Notice>(() => {
    if (initial.recovered === 'reset')
      return { tone: 'warn', text: 'We couldn’t read your saved progress, so you’re starting fresh. A copy of the old data was kept in this browser.' };
    if (initial.recovered === 'partial')
      return { tone: 'info', text: 'Some saved details were damaged and have been repaired. Your cleared levels are intact.' };
    return null;
  });
  const storageAvailable = repo.available !== false;

  // Keep a ref so callbacks always see the latest progress without re-creating.
  const ref = useRef(progress);
  ref.current = progress;

  const commit = useCallback(
    (next: Progress) => {
      ref.current = next;
      setProgress(next);
      repo.save(next);
    },
    [repo],
  );

  // Multiple tabs: pick up saves made elsewhere.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('rerack.progress')) {
        const loaded = repo.load(now());
        ref.current = loaded.progress;
        setProgress(loaded.progress);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [repo, now]);

  const openSession = useCallback(
    (target: string): Session | null => {
      const p = ref.current;
      const active = p.activeSession;
      const isReview = target === 'review';

      // Resume only if every saved challenge still exists (content can change between releases).
      // A resumed session may already be finished (refresh right after the last answer);
      // the player completes it instead of replaying it.
      if (active && active.lessonId === target && active.queue.every((id) => getChallenge(id))) {
        const resumed = normalizeOnResume(active);
        if (resumed !== active) commit({ ...p, activeSession: resumed });
        return resumed;
      }

      let ids: string[];
      if (isReview) {
        ids = buildReviewQueue(p, UNITS, newId());
      } else {
        const lesson = findLesson(UNITS, target);
        if (!lesson || !isUnlocked(p, UNITS, target)) return null;
        ids = lesson.challenges.map((c) => c.id);
      }
      if (ids.length === 0) return null;
      const s = startSession(isReview ? 'review' : 'lesson', target, ids, newId(), now());
      commit({ ...p, activeSession: s });
      return s;
    },
    [commit, now],
  );

  const updateSession = useCallback(
    (s: Session) => {
      commit({ ...ref.current, activeSession: s });
    },
    [commit],
  );

  const finishSession = useCallback(
    (s: Session) => {
      const r = completeSession(ref.current, s, UNITS, now());
      if (!r) return null;
      commit(r.progress);
      setLastResult(r.result);
      return r.result;
    },
    [commit, now],
  );

  const updateProfile = useCallback(
    (patch: Partial<Progress['profile']>) => commit({ ...ref.current, profile: { ...ref.current.profile, ...patch } }),
    [commit],
  );
  const updateSettings = useCallback(
    (patch: Partial<Progress['settings']>) => commit({ ...ref.current, settings: { ...ref.current.settings, ...patch } }),
    [commit],
  );

  const resetAll = useCallback(() => {
    repo.clear();
    const fresh = freshProgress(now());
    setLastResult(null);
    commit(fresh);
  }, [repo, commit, now]);

  const value: Store = {
    progress,
    notice,
    storageAvailable,
    lastResult,
    setNotice,
    openSession,
    updateSession,
    finishSession,
    updateProfile,
    updateSettings,
    resetAll,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}
