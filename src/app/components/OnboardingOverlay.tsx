import { useEffect, useRef } from "react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

export function OnboardingOverlay({ onComplete }: { onComplete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => { dialog.current?.showModal(); }, []);

  return (
    <dialog ref={dialog} className="onboarding" aria-label="Bathroom Finder app guide" onClose={onComplete}>
      <div className="onboarding-content">
        <div className="onboarding-top">
          <div className="onboarding-hint onboarding-search">
            <ArrowUp size={20} strokeWidth={2.5} aria-hidden="true" />
            <p>Search for a specific restroom</p>
          </div>
          <div className="onboarding-hint onboarding-filter">
            <ArrowUp size={20} strokeWidth={2.5} aria-hidden="true" />
            <p>Filter by accessibility and travel mode</p>
          </div>
        </div>

        <div className="onboarding-hint onboarding-pins">
          <ArrowRight size={24} strokeWidth={2.5} aria-hidden="true" />
          <p>Tap any pin to view bathroom details</p>
        </div>

        <div className="onboarding-bottom">
          <div className="onboarding-hint onboarding-tabs">
            <p>Switch between map, favorites, and profile</p>
            <ArrowDown size={20} strokeWidth={2.5} aria-hidden="true" />
          </div>
          <button type="button" className="onboarding-done" onClick={() => dialog.current?.close()}>Got it</button>
        </div>
      </div>
    </dialog>
  );
}
