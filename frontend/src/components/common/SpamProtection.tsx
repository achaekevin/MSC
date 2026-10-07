import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Lock } from 'lucide-react';
import { spamService, SecurityChallenge } from '../../services/spamService';

export interface SpamProtectionData {
  website_hp?: string;
  hp_confirm?: string;
  _formStartTime: number;
  challengeToken: string;
  challengeAnswer: string;
  turnstileToken?: string;
}

interface SpamProtectionProps {
  onChange: (data: SpamProtectionData) => void;
  error?: string;
  className?: string;
}

export const SpamProtection: React.FC<SpamProtectionProps> = ({
  onChange,
  error,
  className = ''
}) => {
  const [challenge, setChallenge] = useState<SecurityChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [loadingChallenge, setLoadingChallenge] = useState<boolean>(false);
  const [startTime] = useState<number>(() => Date.now());

  // Honeypot state (must remain empty for real humans)
  const [honeypotVal, setHoneypotVal] = useState<string>('');

  const loadChallenge = async () => {
    setLoadingChallenge(true);
    try {
      const data = await spamService.getChallenge();
      setChallenge(data);
      setUserAnswer('');
      onChange({
        website_hp: honeypotVal,
        hp_confirm: '',
        _formStartTime: startTime,
        challengeToken: data.token,
        challengeAnswer: ''
      });
    } catch {
      // Handled in spamService fallback
    } finally {
      setLoadingChallenge(false);
    }
  };

  useEffect(() => {
    loadChallenge();
  }, []);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAnswer(val);
    onChange({
      website_hp: honeypotVal,
      hp_confirm: '',
      _formStartTime: startTime,
      challengeToken: challenge?.token || '',
      challengeAnswer: val
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* 
        Honeypot Fields for Bot Trapping
        Hidden from sighted users and screen readers via CSS and aria-hidden.
        Spambots will fill these out automatically and get intercepted.
      */}
      <div
        style={{
          display: 'none',
          opacity: 0,
          position: 'absolute',
          left: '-9999px',
          height: 0,
          width: 0,
          zIndex: -1,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      >
        <label htmlFor="hp_website_confirm">Leave this field blank</label>
        <input
          id="hp_website_confirm"
          type="text"
          name="website_hp"
          value={honeypotVal}
          onChange={(e) => setHoneypotVal(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
        <input
          type="text"
          name="hp_confirm"
          tabIndex={-1}
          autoComplete="off"
        />
        <input
          type="text"
          name="bot_trap"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Human Verification Box */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-forest-50/70 dark:bg-charcoal-900/80 border border-forest-200 dark:border-charcoal-700 shadow-2xs text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-emerald-400 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-charcoal-900 dark:text-warm-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-forest-700 dark:text-emerald-400" />
                Anti-Spam Verification
              </span>
              <p className="text-xs text-charcoal-600 dark:text-warm-300">
                {loadingChallenge ? (
                  <span className="italic">Generating security challenge...</span>
                ) : (
                  <span>
                    Solve to verify you are human: <strong className="text-forest-900 dark:text-emerald-300 font-bold text-sm ml-1">{challenge?.question}</strong>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userAnswer}
              onChange={handleAnswerChange}
              placeholder="Answer"
              className="w-24 px-3 py-1.5 text-sm font-bold text-center rounded-xl border border-warm-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-50 focus:ring-2 focus:ring-forest-600 focus:outline-none"
              aria-label="Security question answer"
              required
            />
            <button
              type="button"
              onClick={loadChallenge}
              disabled={loadingChallenge}
              className="p-2 rounded-xl text-charcoal-500 hover:text-forest-900 dark:text-warm-400 dark:hover:text-emerald-400 hover:bg-forest-100 dark:hover:bg-charcoal-800 transition-colors disabled:opacity-50"
              title="Refresh security question"
              aria-label="Refresh security question"
            >
              <RefreshCw className={`w-4 h-4 ${loadingChallenge ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
