const BASE_URL = import.meta.env.VITE_API_URL as string;

export interface AuthResponse {
  status: string;
  message: any;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface SendOtpPayload {
  recipient: string;
}

export interface ChangePasswordPayload {
  recipient: string;
  otp: string;
  password: string;
}


async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // <-- IMPORTANT
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include", // <-- send cookies automatically
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

async function patch<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

async function put<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

async function del<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    post<AuthResponse>("/auth/login", payload),

  signup: (payload: SignupPayload) =>
    post<AuthResponse>("/auth/signup", payload),

  sendOtp: (payload: SendOtpPayload) =>
    post<AuthResponse>("/auth/sendotp", payload),

  changePassword: (payload: ChangePasswordPayload) =>
    post<AuthResponse>("/auth/changepassword", payload),

  getMe: () =>
    get<AuthResponse>("/auth/me"),

  getAllUsers: () =>
    get<AuthResponse>("/auth/all"),

  getProfile: () =>
    get<AuthResponse>("/auth/getProfile"),

  logout: () =>
    post<AuthResponse>("/auth/logout", {}),

  addUsers: (file: File) => {
    const formData = new FormData();
    // Append with explicit filename — Spring Boot reads this as MultipartFile
    formData.append("file", file, file.name);
    return postFormData<AuthResponse>("/auth/add-users", formData);
  },

  generateTemplate: async () => {
    const res = await fetch(`${BASE_URL}/auth/generate-template`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error(`Failed to download template (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export interface TestCasePayload {
  input: string;
  output: string;
}

export interface ExampleIOPayload {
  input: string;
  output: string;
  description: string;
}

export interface QuestionPayload {
  title: string;
  description: string;
  runTime: number;
  examplesIO: ExampleIOPayload[];
  testcases: TestCasePayload[];
}

export const questionsApi = {
  create: (payload: QuestionPayload) =>
    post<any>("/questions/create", payload),

  modify: (questionId: string | number, payload: QuestionPayload) =>
    put<any>(`/questions/${questionId}`, payload),

  delete: (questionId: string | number) =>
    del<any>(`/questions/${questionId}`),

  getAll: () =>
    get<any>(`/questions/get`),

  modifyTestcases: (questionId: string | number, testcases: TestCasePayload[]) =>
    patch<any>(`/questions/${questionId}/testcases`, testcases),
};


export interface CreateContestPayload {
  name: string;
  attenderID: number[];
  questionID: number[];
  minutes: number;
  startDate: string | null;
  endDate: string | null;
  maxResumeCount: number;
}

export const contestsApi = {
  getAvailable: () =>
    get<any>("/contest/viewavailablecontests"),

  create: (payload: CreateContestPayload) =>
    post<any>("/contest/create", payload),

  getCreatedContests: () =>
    get<any>("/contest/getcreatedcontests"),

  deleteContest: (contestId: string | number) =>
    del<any>(`/contest/deletecontest/${contestId}`),

  modifyContest: (
    contestId: string | number,
    payload: { questionID: number[]; attenderID: number[] }
  ) =>
    patch<any>(`/contest/modify/${contestId}`, payload),

  getContest: (contestId: string | number) =>
    get<any>(`/contest/${contestId}`),

  enterContest: (contestId: string | number) =>
    post<any>(`/contest/${contestId}/entercontest`, {}),

  fetchSubmittedCode: (contestId: string | number, questionId: string | number) =>
    get<any>(`/contest/fetch/${contestId}/${questionId}`),

  executeCode: (
    contestId: string | number,
    payload: { questionID: number; language: string; code: string }
  ) => post<any>(`/contest/${contestId}/execute`, payload),

  runCode: (
    contestId: string | number,
    payload: { questionID: number; language: string; code: string }
  ) => post<any>(`/contest/${contestId}/run`, payload),

  updateResumeCount: (contestId: number) =>
    patch<any>("/contest/resumecount", { contestID: contestId }),
};

export const reportsApi = {
  getContestsOver: () =>
    get<any>("/reports/contestsOver"),

  getLeaderboard: (contestId: string | number) =>
    get<any>(`/leaderboard/${contestId}`),

  downloadLeaderboardReport: async (contestId: string | number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/leaderboard/report/${contestId}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message ?? `Download failed (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    // Try to use the filename from Content-Disposition, fall back to a sensible default
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename\*?=["']?(?:UTF-8'')?([^"';\n]+)/i);
    a.download = match?.[1] ?? `leaderboard-${contestId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  exportContestReport: async (contestId: string | number, contestName?: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}/reports/export/${contestId}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message ?? `Export failed (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename\*?=["']?(?:UTF-8'')?([^"';\n]+)/i);
    const safeName = contestName?.replace(/[^a-z0-9]/gi, "_") ?? `contest-${contestId}`;
    a.download = match?.[1] ?? `${safeName}-report.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export const api = {
  get,
  post,
  patch,
  delete: del,
};