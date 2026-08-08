import { useState } from "react";
import { questionsApi } from "../services/api";
import type { TestCasePayload, ExampleIOPayload, QuestionPayload } from "../services/api";
import { type Question, type TestCase, mapBackendQuestion } from "../types";

// ─── Hook Return Shape ────────────────────────────────────────────────────────

export interface UseQuestionsReturn {
  // Data
  questions: Question[];
  filteredQuestions: Question[];
  activeQuestion: Question | undefined;

  // Loading / Error
  isLoadingQuestions: boolean;
  fetchError: string;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (v: string) => void;

  // Question Modal
  isQuestionModalOpen: boolean;
  modalMode: "add" | "edit";
  formTitle: string;
  setFormTitle: (v: string) => void;
  formDesc: string;
  setFormDesc: (v: string) => void;
  formRunTime: number;
  setFormRunTime: (v: number) => void;
  formError: string;
  isSubmittingQuestion: boolean;
  formExamples: ExampleIOPayload[];
  setFormExamples: React.Dispatch<React.SetStateAction<ExampleIOPayload[]>>;
  formTestcases: TestCasePayload[];
  setFormTestcases: React.Dispatch<React.SetStateAction<TestCasePayload[]>>;
  handleOpenAdd: () => void;
  handleOpenEdit: (q: Question) => void;
  handleSaveQuestion: (e: React.FormEvent) => Promise<void>;
  closeQuestionModal: () => void;

  // Delete Modal
  isDeleteModalOpen: boolean;
  isDeletingQuestion: boolean;
  triggerDeleteConfirm: (id: string) => void;
  handleConfirmDelete: () => Promise<void>;
  closeDeleteModal: () => void;

  // Testcase Modal
  isTestcaseModalOpen: boolean;
  isUpdatingTestcases: boolean;
  tcInput: string;
  setTcInput: (v: string) => void;
  tcOutput: string;
  setTcOutput: (v: string) => void;
  tcIsSample: boolean;
  setTcIsSample: (v: boolean) => void;
  editingTestCaseId: string | null;
  tcError: string;
  handleOpenTestcases: (qId: string) => void;
  handleSaveTestCase: (e: React.FormEvent) => Promise<void>;
  handleEditTestCase: (tc: TestCase) => void;
  handleDeleteTestCase: (tcId: string) => Promise<void>;
  cancelEditTestCase: () => void;
  closeTestcaseModal: () => void;

  // Utilities
  getDifficultyColor: (diff: "Easy" | "Medium" | "Hard") => string;
  fetchQuestions: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuestions(): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [fetchError, setFetchError] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");

  // Question Modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formRunTime, setFormRunTime] = useState<number>(5000);
  const [formError, setFormError] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [formExamples, setFormExamples] = useState<ExampleIOPayload[]>([]);
  const [formTestcases, setFormTestcases] = useState<TestCasePayload[]>([]);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);

  // Testcase Modal
  const [isTestcaseModalOpen, setIsTestcaseModalOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [tcInput, setTcInput] = useState("");
  const [tcOutput, setTcOutput] = useState("");
  const [tcIsSample, setTcIsSample] = useState(false);
  const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(null);
  const [tcError, setTcError] = useState("");
  const [isUpdatingTestcases, setIsUpdatingTestcases] = useState(false);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === "All" || q.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const activeQuestion = questions.find((q) => q.id === activeQuestionId);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    setFetchError("");
    try {
      const res = await questionsApi.getAll();
      if (res.status === "success" && Array.isArray(res.message)) {
        setQuestions(res.message.map(mapBackendQuestion));
      } else {
        setFetchError("Failed to retrieve questions list.");
      }
    } catch (err: any) {
      console.error("Error loading questions:", err);
      setFetchError(err.message || "Failed to load questions. Please check connection.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // ─── Question Modal Handlers ───────────────────────────────────────────────

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormTitle("");
    setFormDesc("");
    setFormRunTime(5000);
    setFormError("");
    setFormExamples([]);
    setFormTestcases([]);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setModalMode("edit");
    setEditingQuestionId(q.id);
    setFormTitle(q.title);
    setFormDesc(q.description);
    setFormRunTime(q.runTime);
    setFormError("");
    // Pre-populate examples (sample test cases) and testcases
    setFormExamples(
      q.testCases
        .filter((tc) => tc.isSample)
        .map((tc) => ({ input: tc.input, output: tc.output, description: "" }))
    );
    setFormTestcases(
      q.testCases.map((tc) => ({ input: tc.input, output: tc.output }))
    );
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim()) { setFormError("Title is required."); return; }
    if (!formDesc.trim()) { setFormError("Description is required."); return; }

    if (modalMode === "add") {
      setIsSubmittingQuestion(true);
      try {
        const payload: QuestionPayload = {
          title: formTitle.trim(),
          description: formDesc.trim(),
          runTime: formRunTime,
          examplesIO: formExamples.filter((ex) => ex.input.trim() || ex.output.trim()),
          testcases: formTestcases.filter((tc) => tc.input.trim() || tc.output.trim()),
        };
        const res = await questionsApi.create(payload);
        if (res.status === "success") {
          await fetchQuestions();
          setIsQuestionModalOpen(false);
        } else {
          setFormError(res.message || "Failed to create question on the server.");
        }
      } catch (err: any) {
        setFormError(err.message || "An error occurred while creating the question.");
      } finally {
        setIsSubmittingQuestion(false);
      }
    } else {
      // Edit: send full payload to modify endpoint
      if (!editingQuestionId) return;
      setIsSubmittingQuestion(true);
      try {
        const payload: QuestionPayload = {
          title: formTitle.trim(),
          description: formDesc.trim(),
          runTime: formRunTime,
          examplesIO: formExamples.filter((ex) => ex.input.trim() || ex.output.trim()),
          testcases: formTestcases.filter((tc) => tc.input.trim() || tc.output.trim()),
        };
        const res = await questionsApi.modify(editingQuestionId, payload);
        if (res.status === "success") {
          await fetchQuestions();
          setIsQuestionModalOpen(false);
          setEditingQuestionId(null);
        } else {
          setFormError(res.message || "Failed to modify question on the server.");
        }
      } catch (err: any) {
        setFormError(err.message || "An error occurred while modifying the question.");
      } finally {
        setIsSubmittingQuestion(false);
      }
    }
  };

  const closeQuestionModal = () => setIsQuestionModalOpen(false);

  // ─── Delete Handlers ───────────────────────────────────────────────────────

  const triggerDeleteConfirm = (id: string) => {
    setDeletingQuestionId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuestionId) return;
    setIsDeletingQuestion(true);
    try {
      const res = await questionsApi.delete(deletingQuestionId);
      if (res.status === "success") {
        setQuestions((prev) => prev.filter((q) => q.id !== deletingQuestionId));
        setIsDeleteModalOpen(false);
        setDeletingQuestionId(null);
      } else {
        alert(res.message || "Failed to delete question.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting the question.");
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingQuestionId(null);
  };

  // ─── Testcase Handlers ─────────────────────────────────────────────────────

  const handleOpenTestcases = (qId: string) => {
    setActiveQuestionId(qId);
    setTcInput("");
    setTcOutput("");
    setTcIsSample(false);
    setEditingTestCaseId(null);
    setTcError("");
    setIsTestcaseModalOpen(true);
  };

  const handleSaveTestCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setTcError("");

    if (!tcInput.trim()) { setTcError("Testcase Input is required."); return; }
    if (!tcOutput.trim()) { setTcError("Expected Output is required."); return; }
    if (!activeQuestionId || !activeQuestion) return;

    let updatedTestCases: TestCase[];
    if (editingTestCaseId) {
      updatedTestCases = activeQuestion.testCases.map((tc) =>
        tc.id === editingTestCaseId
          ? { ...tc, input: tcInput.trim(), output: tcOutput.trim(), isSample: tcIsSample }
          : tc
      );
    } else {
      const newTc: TestCase = {
        id: "tc-" + Date.now(),
        input: tcInput.trim(),
        output: tcOutput.trim(),
        isSample: tcIsSample,
      };
      updatedTestCases = [...activeQuestion.testCases, newTc];
    }

    setIsUpdatingTestcases(true);
    try {
      const payload: TestCasePayload[] = updatedTestCases.map((t) => ({
        input: t.input,
        output: t.output,
      }));
      const res = await questionsApi.modifyTestcases(activeQuestionId, payload);
      if (res.status === "success") {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === activeQuestionId ? { ...q, testCases: updatedTestCases } : q
          )
        );
        setEditingTestCaseId(null);
        setTcInput("");
        setTcOutput("");
        setTcIsSample(false);
      } else {
        setTcError(res.message || "Failed to update test cases on backend.");
      }
    } catch (err: any) {
      setTcError(err.message || "An error occurred while saving the test case.");
    } finally {
      setIsUpdatingTestcases(false);
    }
  };

  const handleEditTestCase = (tc: TestCase) => {
    setEditingTestCaseId(tc.id);
    setTcInput(tc.input);
    setTcOutput(tc.output);
    setTcIsSample(tc.isSample);
    setTcError("");
  };

  const handleDeleteTestCase = async (tcId: string) => {
    if (!activeQuestionId || !activeQuestion) return;
    const updatedTestCases = activeQuestion.testCases.filter((tc) => tc.id !== tcId);

    setIsUpdatingTestcases(true);
    try {
      const payload: TestCasePayload[] = updatedTestCases.map((t) => ({
        input: t.input,
        output: t.output,
      }));
      const res = await questionsApi.modifyTestcases(activeQuestionId, payload);
      if (res.status === "success") {
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === activeQuestionId ? { ...q, testCases: updatedTestCases } : q
          )
        );
        if (editingTestCaseId === tcId) {
          setEditingTestCaseId(null);
          setTcInput("");
          setTcOutput("");
          setTcIsSample(false);
        }
      } else {
        alert(res.message || "Failed to delete test case from server.");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting the test case.");
    } finally {
      setIsUpdatingTestcases(false);
    }
  };

  const cancelEditTestCase = () => {
    setEditingTestCaseId(null);
    setTcInput("");
    setTcOutput("");
    setTcIsSample(false);
    setTcError("");
  };

  const closeTestcaseModal = () => setIsTestcaseModalOpen(false);

  // ─── Utility ──────────────────────────────────────────────────────────────

  const getDifficultyColor = (diff: "Easy" | "Medium" | "Hard") => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30";
      case "Medium":
        return "bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400 border-amber-100 dark:border-amber-900/30";
      case "Hard":
        return "bg-rose-50 text-rose-600 dark:bg-rose-950/35 dark:text-rose-400 border-rose-100 dark:border-rose-900/30";
    }
  };

  return {
    questions,
    filteredQuestions,
    activeQuestion,
    isLoadingQuestions,
    fetchError,
    searchQuery,
    setSearchQuery,
    difficultyFilter,
    setDifficultyFilter,
    isQuestionModalOpen,
    modalMode,
    formTitle,
    setFormTitle,
    formDesc,
    setFormDesc,
    formRunTime,
    setFormRunTime,
    formError,
    isSubmittingQuestion,
    formExamples,
    setFormExamples,
    formTestcases,
    setFormTestcases,
    handleOpenAdd,
    handleOpenEdit,
    handleSaveQuestion,
    closeQuestionModal,
    isDeleteModalOpen,
    isDeletingQuestion,
    triggerDeleteConfirm,
    handleConfirmDelete,
    closeDeleteModal,
    isTestcaseModalOpen,
    isUpdatingTestcases,
    tcInput,
    setTcInput,
    tcOutput,
    setTcOutput,
    tcIsSample,
    setTcIsSample,
    editingTestCaseId,
    tcError,
    handleOpenTestcases,
    handleSaveTestCase,
    handleEditTestCase,
    handleDeleteTestCase,
    cancelEditTestCase,
    closeTestcaseModal,
    getDifficultyColor,
    fetchQuestions,
  };
}

