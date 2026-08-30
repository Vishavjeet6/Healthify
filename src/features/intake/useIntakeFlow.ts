import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { track } from '../analytics';
import { recordRedFlagCheck, saveIntake } from '../../db/queries/profile';
import { INTAKE_CHAPTERS } from './chapters';
import { useIntakeStore } from './intakeStore';
import { checkRedFlags } from './redFlags';
import { INTAKE_STEPS, type IntakeStep } from './steps';
import type { IntakeAnswers } from './types';
import { computeVariant } from './variant';

/**
 * Shared state + submit logic behind both onboarding chapter skins
 * (cool: app/(onboarding)/chapter/[id].tsx, warm: same route, warm
 * branch). Business logic only — no rendering. Reuses steps.ts /
 * redFlags.ts / variant.ts exactly as the old single-step intake.tsx
 * did; this is a regrouping layer, not a rewrite of intake logic.
 */
export function useIntakeFlow() {
  const db = useSQLiteContext();
  const answers = useIntakeStore((s) => s.answers);
  const answerStep = useIntakeStore((s) => s.answerStep);

  function stepsFor(chapterIndex: number): IntakeStep[] {
    const chapter = INTAKE_CHAPTERS[chapterIndex];
    return chapter.stepIds
      .map((id) => INTAKE_STEPS.find((s) => s.id === id))
      .filter((s): s is IntakeStep => !!s && !s.skip?.(answers));
  }

  async function finish(finalAnswers: Partial<IntakeAnswers>) {
    const complete = finalAnswers as IntakeAnswers;
    const { variant } = computeVariant(complete);
    await saveIntake(db, variant, JSON.stringify(complete));

    const redFlag = checkRedFlags(complete);
    await recordRedFlagCheck(db, redFlag.flagged);
    if (redFlag.flagged) {
      await track(db, 'red_flag_shown');
      router.push({ pathname: '/(onboarding)/check', params: { next: '/(onboarding)/assessment' } });
    } else {
      router.push('/(onboarding)/assessment');
    }
  }

  function goToChapter(nextIndex: number, latestAnswers: Partial<IntakeAnswers>) {
    if (nextIndex >= INTAKE_CHAPTERS.length) {
      finish(latestAnswers);
    } else {
      router.push(`/(onboarding)/chapter/${INTAKE_CHAPTERS[nextIndex].id}`);
    }
  }

  return { answers, answerStep, stepsFor, goToChapter, finish };
}
