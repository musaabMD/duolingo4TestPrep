export type ExamId =
  | "sat"
  | "act"
  | "mcat"
  | "usmle"
  | "gre"
  | "lsat";

export type DailyGoal = 10 | 20 | 30 | 60;

export type StudyTime =
  | "morning"
  | "afternoon"
  | "night"
  | "flexible";

export type KnowledgeLevel = "beginner" | "intermediate" | "advanced";

export type OnboardingState = {
  examId: ExamId | null;
  examDate: string | null;
  knowledgeLevel: KnowledgeLevel | null;
  dailyGoal: DailyGoal | null;
  studyTime: StudyTime | null;
  completed: boolean;
};

export type ReviewRecord = {
  questionId: string;
  examId: ExamId;
  selectedIndex: number;
  correct: boolean;
  flagged: boolean;
  answeredAt: string;
};

export type QuestionReport = {
  questionId: string;
  examId: ExamId;
  reason: string;
  note: string;
  reportedAt: string;
};

export type ExamOption = {
  id: ExamId;
  name: string;
  short: string;
  blurb: string;
  topics: string[];
};

export type PracticeQuestion = {
  id: string;
  examId: ExamId;
  topic: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};
