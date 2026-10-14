export type Commit = {
  hash: string;
  when: string;
  message: string;
  kind: "head" | "award" | "leadership" | "education";
};

export const wins = [
  { place: "1st Runner-Up", event: "ComFix 2026", where: "University of Moratuwa" },
  { place: "2nd Runner-Up", event: "Aurora 2026 · Sentrio", where: "University of Sri Jayewardenepura" },
  { place: "1st, Round 1", event: "OctWave 3.0 Kaggle", where: "Team Mora Vortex" },
  { place: "Finalist", event: "Codesplash AI Agent 2026", where: "University of Kelaniya" },
];

export const timeline: Commit[] = [
  { hash: "a7f3c21", when: "2026", message: "feat: IT & Media Coordinator, UoM Dancing Society", kind: "head" },
  { hash: "9e1b0d4", when: "2026", message: "win: 1st Runner-Up, ComFix 2026", kind: "award" },
  { hash: "4c88a2f", when: "2026", message: "win: 2nd Runner-Up, Aurora 2026 (Sentrio)", kind: "award" },
  { hash: "62d0e9b", when: "2026", message: "win: Finalist, Codesplash AI Agent Hackathon", kind: "award" },
  { hash: "1f5a7c3", when: "2025", message: "win: 1st place Round 1, OctWave 3.0 Kaggle", kind: "award" },
  { hash: "b30e6f8", when: "2025–26", message: "chore: Organizing Committee, FIT Future Career Fair", kind: "leadership" },
  { hash: "0d9c4e1", when: "2024", message: "init: BSc (Hons) IT, University of Moratuwa", kind: "education" },
  { hash: "e5a12b7", when: "2023", message: "build: G.C.E. A/L, Rahula College Matara (Z 2.065)", kind: "education" },
];
