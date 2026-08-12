// ─── Shared Domain Types ──────────────────────────────────────────────────────

export interface TestCase {
  id: string;
  input: string;
  output: string;
  isSample: boolean;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty?: string;
  runTime: number; // in milliseconds
  testCases: TestCase[];
}

// ─── Backend → Frontend Mapper ────────────────────────────────────────────────

export const mapBackendQuestion = (bq: any): Question => {
  const examples = bq.examplesIO || [];
  const tcs = bq.testcases || [];

  const testCases: TestCase[] = tcs.map((t: any, index: number) => {
    const isSample = examples.some(
      (ex: any) => ex.input === t.input && ex.output === t.output
    );
    return {
      id: `tc-${bq.id}-${index}-${Date.now()}`,
      input: t.input,
      output: t.output,
      isSample,
    };
  });

  // Include any examples not already in the testcases list
  examples.forEach((ex: any, index: number) => {
    const exists = testCases.some(
      (t) => t.input === ex.input && t.output === ex.output
    );
    if (!exists) {
      testCases.push({
        id: `ex-${bq.id}-${index}-${Date.now()}`,
        input: ex.input,
        output: ex.output,
        isSample: true,
      });
    }
  });

  return {
    id: String(bq.id),
    title: bq.title,
    description: bq.description,
    difficulty: bq.difficulty,
    runTime: bq.runTime ?? 5000, // in milliseconds
    testCases,
  };
};

export interface ContestUser {
  id: number;
  name: string;
  email: string;
}

export interface ContestQuestion {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  examples?: any[];
  tc?: any[];
  runTime?: number; // in milliseconds
  user?: ContestUser;
}

export interface Contest {
  id: number;
  contestname: string;
  minutes: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  user: ContestUser;
  attenders: ContestUser[];
  questions: ContestQuestion[];
}
