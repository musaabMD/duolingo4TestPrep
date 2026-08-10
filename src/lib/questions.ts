import type { ExamId, PracticeQuestion } from "./types";

export const QUESTIONS: PracticeQuestion[] = [
  {
    id: "sat-1",
    examId: "sat",
    topic: "Algebra",
    prompt: "If 3x − 7 = 11, what is the value of x?",
    choices: ["4", "6", "5", "18"],
    correctIndex: 1,
    explanation:
      "Add 7 to both sides: 3x = 18. Divide by 3: x = 6.",
  },
  {
    id: "sat-2",
    examId: "sat",
    topic: "Reading",
    prompt:
      "A passage argues that urban parks increase community wellbeing. Which choice best supports that claim?",
    choices: [
      "A list of park construction costs",
      "Survey data showing lower stress near green spaces",
      "A biography of a famous landscape architect",
      "A timeline of zoning laws",
    ],
    correctIndex: 1,
    explanation:
      "Direct evidence linking parks to wellbeing supports the claim; costs or history do not.",
  },
  {
    id: "act-1",
    examId: "act",
    topic: "Science",
    prompt:
      "In an experiment, plants grow taller under blue light than red light. What is the independent variable?",
    choices: [
      "Plant height",
      "Soil type",
      "Light color",
      "Number of leaves",
    ],
    correctIndex: 2,
    explanation:
      "The independent variable is what the researcher changes — light color.",
  },
  {
    id: "mcat-1",
    examId: "mcat",
    topic: "Bio/Biochem",
    prompt:
      "Which organelle is primarily responsible for ATP production in eukaryotic cells?",
    choices: ["Golgi apparatus", "Mitochondrion", "Lysosome", "Ribosome"],
    correctIndex: 1,
    explanation:
      "Mitochondria generate most cellular ATP via oxidative phosphorylation.",
  },
  {
    id: "mcat-2",
    examId: "mcat",
    topic: "CARS",
    prompt:
      "An author claims ‘correlation is not causation.’ Which example best illustrates that idea?",
    choices: [
      "Ice cream sales and drowning deaths both rise in summer",
      "A drug trial with a randomized control group",
      "Measuring blood pressure twice for accuracy",
      "A chemistry reaction following stoichiometric ratios",
    ],
    correctIndex: 0,
    explanation:
      "Both rise with summer heat — they are correlated without one causing the other.",
  },
  {
    id: "usmle-1",
    examId: "usmle",
    topic: "Pathology",
    prompt:
      "A patient with long-standing hypertension is most at risk for which cardiac change?",
    choices: [
      "Right ventricular atrophy",
      "Left ventricular hypertrophy",
      "Atrial septal defect",
      "Pulmonary valve stenosis",
    ],
    correctIndex: 1,
    explanation:
      "Chronic afterload elevation drives concentric left ventricular hypertrophy.",
  },
  {
    id: "gre-1",
    examId: "gre",
    topic: "Quant",
    prompt: "What is 15% of 240?",
    choices: ["24", "30", "36", "40"],
    correctIndex: 2,
    explanation: "0.15 × 240 = 36.",
  },
  {
    id: "lsat-1",
    examId: "lsat",
    topic: "Logical Reasoning",
    prompt:
      "All excellent debaters practice daily. Maya practices daily. Which conclusion is valid?",
    choices: [
      "Maya is an excellent debater",
      "Maya might or might not be an excellent debater",
      "Maya does not debate",
      "Only Maya practices daily",
    ],
    correctIndex: 1,
    explanation:
      "Practicing daily is necessary for excellence here, not sufficient — so Maya’s status is undetermined.",
  },
];

export function questionsForExam(examId: ExamId | null): PracticeQuestion[] {
  if (!examId) return QUESTIONS.slice(0, 3);
  const matched = QUESTIONS.filter((q) => q.examId === examId);
  if (matched.length >= 3) return matched;
  return [...matched, ...QUESTIONS.filter((q) => q.examId !== examId)].slice(
    0,
    3,
  );
}
