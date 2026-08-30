export type IntakeAnswers = {
  age: number;
  bmi: number | null;
  smoker: boolean;
  sedentary: boolean;
  onset: 'gradual' | 'sudden' | 'unsure';
  situational: boolean; // fine alone / with some partners, not others
  morningErections: 'normal' | 'reduced' | 'absent' | 'unsure';
  selfReportedAnxiety: boolean;
  recentLifeStressor: boolean;
  diagnosedHypertension: boolean;
  diagnosedDiabetes: boolean;
  diabetesTreated: boolean; // only meaningful if diagnosedDiabetes
  diagnosedHighCholesterol: boolean;
  diagnosedCardiovascularDisease: boolean;
  cardiovascularDiseaseTreated: boolean; // only meaningful if diagnosedCardiovascularDisease
  exertionalSymptoms: boolean; // chest pain / breathlessness on exertion
  onsetAfterPelvicEvent: boolean; // surgery, trauma, radiotherapy
  penilePainOrCurvature: boolean;
};
