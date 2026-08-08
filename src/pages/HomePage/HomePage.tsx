import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuestions } from "../../hooks/useQuestions";
import DashboardView from "../../components/Home/DashboardView";
import QuestionsView from "../../components/Home/QuestionsView";
import QuestionModal from "../../components/Home/QuestionModal";
import DeleteModal from "../../components/Home/DeleteModal";
import TestcaseModal from "../../components/Home/TestcaseModal";

type View = "dashboard" | "questions";

export default function HomePage() {
  const { userEmail, userProfile } = useAuth();
  const displayName = userProfile?.name || (userEmail ? userEmail.split("@")[0] : "there");
  const location = useLocation();
  const navigate = useNavigate();

  const initialView: View =
    location.pathname === "/questions" ? "questions" : "dashboard";
  const [view, setView] = useState<View>(initialView);

  const q = useQuestions();

  const goToQuestions = () => {
    navigate("/questions");
    setView("questions");
    if (q.questions.length === 0) {
      q.fetchQuestions();
    }
  };

  const goToDashboard = () => {
    navigate("/home");
    setView("dashboard");
  };

  return (
    <>
      {view === "dashboard" ? (
        <DashboardView name={displayName} onGoToQuestions={goToQuestions} />
      ) : (
        <QuestionsView
          filteredQuestions={q.filteredQuestions}
          isLoadingQuestions={q.isLoadingQuestions}
          fetchError={q.fetchError}
          searchQuery={q.searchQuery}
          onSearchChange={q.setSearchQuery}
          onBackToDashboard={goToDashboard}
          onAddQuestion={q.handleOpenAdd}
          onEditQuestion={q.handleOpenEdit}
          onDeleteQuestion={q.triggerDeleteConfirm}
          onManageTestcases={q.handleOpenTestcases}
        />
      )}

      {q.isQuestionModalOpen && (
        <QuestionModal
          modalMode={q.modalMode}
          formTitle={q.formTitle}
          onTitleChange={q.setFormTitle}
          formDesc={q.formDesc}
          onDescChange={q.setFormDesc}
          formRunTime={q.formRunTime}
          onRunTimeChange={q.setFormRunTime}
          formError={q.formError}
          isSubmittingQuestion={q.isSubmittingQuestion}
          formExamples={q.formExamples}
          setFormExamples={q.setFormExamples}
          formTestcases={q.formTestcases}
          setFormTestcases={q.setFormTestcases}
          onSave={q.handleSaveQuestion}
          onClose={q.closeQuestionModal}
        />
      )}

      {q.isDeleteModalOpen && (
        <DeleteModal
          isDeletingQuestion={q.isDeletingQuestion}
          onConfirm={q.handleConfirmDelete}
          onClose={q.closeDeleteModal}
        />
      )}

      {q.isTestcaseModalOpen && q.activeQuestion && (
        <TestcaseModal
          activeQuestion={q.activeQuestion}
          tcInput={q.tcInput}
          onTcInputChange={q.setTcInput}
          tcOutput={q.tcOutput}
          onTcOutputChange={q.setTcOutput}
          tcIsSample={q.tcIsSample}
          onTcIsSampleChange={q.setTcIsSample}
          editingTestCaseId={q.editingTestCaseId}
          tcError={q.tcError}
          isUpdatingTestcases={q.isUpdatingTestcases}
          onSaveTestCase={q.handleSaveTestCase}
          onEditTestCase={q.handleEditTestCase}
          onDeleteTestCase={q.handleDeleteTestCase}
          onCancelEdit={q.cancelEditTestCase}
          onClose={q.closeTestcaseModal}
        />
      )}
    </>
  );
}
