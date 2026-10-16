import React, { useEffect, useRef, useState } from "react";
import { listPageStyles } from "../assets/dummyStyles.jsx";
import { useApi } from "../services/api.js";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  FileText,
  Filter,
  Plus,
  Pencil,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

const ListCompo = () => {
  const { request } = useApi();

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    techId: null,
    techName: "",
  }); //as a pop up
  const [technologies, setTechnologies] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [targetQuestionCount, setTargetQuestionCount] = useState(1);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    answerKey: "A",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All"); //all level will shown
  const [animateBorder, setAnimateBorder] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const toastTimerRef = useRef(null);

  //to fetch technologies from the server side
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await request("/admin/quizzes");
        const formatted = data.map((q) => ({
          id: q._id,
          name: q.technology,
          subName: q.subName || "",
          level: q.level,
          timeLimit: q.timeLimit,
          questions: q.totalQuestions,
          questionItems: q.questions || [],
          uploadDate: q.createdAt,
          color: "bg-linear-to-r from-cyan-500 to-blue-500",
          icon: <Cpu className="w-5 h-5 md:w-6 md:h-6" />,
          status: "active",
          stars: 4.5,
        }));
        setTechnologies(formatted);
      } catch (error) {
        console.log("fetch error:", error);
      }
    };
    loadQuizzes();
  }, []);

  useEffect(() => {
    setAnimateBorder(true);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []); //for ui

  //to delete a technology
  const deleteTechnology = async (id) => {
    try {
      const techToDelete = technologies.find((t) => t.id === id);

      await request(`/admin/quiz/${id}`, "DELETE");

      setTechnologies((prev) => prev.filter((tech) => tech.id !== id));

      setToast({
        visible: true,
        message: `${techToDelete?.name || "Item"} deleted`,
        type: "success",
      });
    } catch (error) {
      console.error("DELETE ERROR:", error);
    }
  };

  const closeToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast((t) => ({
      ...t,
      visible: false,
    }));
  };

  const openQuestionManager = (quiz) => {
    setEditingQuiz({ ...quiz, questionItems: [...quiz.questionItems] });
    setTargetQuestionCount(Math.max(1, quiz.questionItems.length));
    setEditingQuestionIndex(null);
    setNewQuestion({ question: "", options: ["", "", "", ""], answerKey: "A" });
  };

  const addManualQuestion = () => {
    if (
      !newQuestion.question.trim() ||
      newQuestion.options.some((option) => !option.trim())
    ) {
      setToast({ visible: true, type: "error", message: "Enter a question and all four options." });
      return;
    }

    const questionToSave = {
      question: newQuestion.question.trim(),
      options: newQuestion.options.map((option) => option.trim()),
      answerKey: newQuestion.answerKey,
    };

    setEditingQuiz((quiz) => ({
      ...quiz,
      questionItems:
        editingQuestionIndex === null
          ? [...quiz.questionItems, questionToSave]
          : quiz.questionItems.map((item, index) =>
              index === editingQuestionIndex ? questionToSave : item,
            ),
    }));
    setEditingQuestionIndex(null);
    setNewQuestion({ question: "", options: ["", "", "", ""], answerKey: "A" });
  };

  const editQuestion = (question, index) => {
    setEditingQuestionIndex(index);
    setNewQuestion({
      question: question.question || "",
      options: [...(question.options || ["", "", "", ""])],
      answerKey: question.answerKey || "A",
    });
  };

  const removeQuestion = (index) => {
    setEditingQuiz((quiz) => ({
      ...quiz,
      questionItems: quiz.questionItems.filter((_, itemIndex) => itemIndex !== index),
    }));
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
      setNewQuestion({ question: "", options: ["", "", "", ""], answerKey: "A" });
    }
  };

  const cancelQuestionEdit = () => {
    setEditingQuestionIndex(null);
    setNewQuestion({ question: "", options: ["", "", "", ""], answerKey: "A" });
  };

  const saveQuestions = async () => {
    if (!editingQuiz || editingQuiz.questionItems.length === 0) return;

    // The target remains optional: it only blocks saving when the admin has
    // explicitly set a higher count to fill missing questions.
    if (editingQuiz.questionItems.length < targetQuestionCount) {
      setToast({
        visible: true,
        type: "error",
        message: `Add ${targetQuestionCount - editingQuiz.questionItems.length} more question(s) before saving.`,
      });
      return;
    }

    try {
      const data = await request(
        `/admin/quiz/${editingQuiz.id}/questions`,
        "PUT",
        { questions: editingQuiz.questionItems },
      );
      setTechnologies((items) =>
        items.map((item) =>
          item.id === editingQuiz.id
            ? { ...item, questions: data.quiz.totalQuestions, questionItems: data.quiz.questions }
            : item,
        ),
      );
      setEditingQuiz(null);
      setToast({ visible: true, type: "success", message: "Questions updated successfully." });
    } catch (error) {
      setToast({ visible: true, type: "error", message: error.message || "Unable to update questions." });
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Basic":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Intermediate":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Advanced":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case "Basic":
        return <CheckCircle className={listPageStyles.levelIconBase} />;
      case "Intermediate":
        return <AlertCircle className={listPageStyles.levelIconBase} />;
      case "Advanced":
        return <XCircle className={listPageStyles.levelIconBase} />;
      default:
        return null;
    }
  };

  const formatUploadDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  }; //according to date month and filter

  const filteredTechnologies = technologies.filter((tech) => {
    const matchesSearch = tech.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesLevel =
      selectedLevel === "All" || tech.level === selectedLevel;
    return matchesSearch && matchesLevel;
  }); //filter by name and filter

  return (
    <div className={listPageStyles.page}>
      <style>{listPageStyles.customCSS}</style>
      <div className={listPageStyles.container}>
        <div className={listPageStyles.headerWrapper}>
          <div className={listPageStyles.headerInner}>
            <h1 className={listPageStyles.title}>Tech Quiz Master</h1>
            <p className={listPageStyles.subtitle}>
              Create, manage and review technology quizzes with an intutive
              responsive layout
            </p>
          </div>
          <div className={listPageStyles.searchContainer}>
            <div
              className={`${listPageStyles.animatedBorderBase} ${
                animateBorder ? listPageStyles.animatedBorderActive : ""
              }`}
            />
            <div className={listPageStyles.inputWrapper}>
              <div className="relative">
                <Search className={listPageStyles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search Technologies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${listPageStyles.inputBase} ${selectedLevel !== "All" ? listPageStyles.inputBorderTransparent : listPageStyles.inputBorder}`}
                />
                <div className={listPageStyles.filterWrapper}>
                  <div className="flex items-center gap-2">
                    <Filter className={listPageStyles.filterIcon} />
                    <select
                      value={selectedLevel}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedLevel(v);
                        setAnimateBorder(v === "All");
                      }}
                      className={listPageStyles.select}
                      style={{
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                      }}
                    >
                      <option value="All">All Levels</option>
                      <option value="Basic">Basic</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Toast Notification */}
          <div aria-live="polite" className={listPageStyles.toastContainer}>
            <div
              className={`${listPageStyles.toastOuter} ${
                toast.visible
                  ? listPageStyles.toastVisible
                  : listPageStyles.toastHidden
              }`}
            >
              <div className={listPageStyles.toastInner}>
                <div className={listPageStyles.toastIconBox}>
                  <CheckCircle className={listPageStyles.toastIcon} />
                </div>
                <div className="flex-1">
                  <p className={listPageStyles.toastMessage}>{toast.message}</p>
                </div>
                <button
                  onClick={closeToast}
                  className={listPageStyles.toastClose}
                  aria-label="Close notification"
                >
                  <X className={listPageStyles.toastCloseIcon} />
                </button>
              </div>
            </div>
          </div>
          <div className={listPageStyles.grid}>
            {filteredTechnologies.map((tech, index) => (
              <div
                key={tech.id}
                className={listPageStyles.cardGroup}
                style={{
                  animationDelay: `${index * 70}ms`,
                }}
              >
                <div className={listPageStyles.card}>
                  <div className={`${listPageStyles.cardHeader} ${tech.color}`}>
                    <div className={listPageStyles.cardHeaderInner}>
                      <div className={listPageStyles.cardHeaderLeft}>
                        <div className={listPageStyles.iconWrapper}>
                          {tech.icon}
                        </div>
                        <div className="min-w-0 ">
                          <h3 className={listPageStyles.techName}>
                            {tech.name}
                          </h3>
                          {tech.subName && (
                            <p className="mt-1 text-sm font-medium text-white/85">
                              {tech.subName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-0">
                        <div
                          className={`${listPageStyles.levelBadgeBase} ${getLevelColor(tech.level)}`}
                        >
                          {getLevelIcon(tech.level)}
                          <span className="font-bold lg:mt-1 lg:text-center">
                            {tech.level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Card Body */}
                  <div className={listPageStyles.cardBody}>
                    <div className={listPageStyles.cardBodyContent}>
                      {/* Time and Questions */}
                      <div className={listPageStyles.statsGrid}>
                        <div
                          className={`${listPageStyles.statCardBase} ${listPageStyles.statCardTime}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`${listPageStyles.statIconBox} ${listPageStyles.statIconBoxBlue}`}
                            >
                              <Clock
                                className={`${listPageStyles.statIcon} ${listPageStyles.statIconBlue}`}
                              />
                            </div>
                            <div>
                              <p className={listPageStyles.statLabel}>Time</p>
                              <p className={listPageStyles.statValue}>
                                {tech.timeLimit} min
                              </p>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`${listPageStyles.statCardBase} ${listPageStyles.statCardQuestions}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`${listPageStyles.statIconBox} ${listPageStyles.statIconBoxEmerald}`}
                            >
                              <FileText
                                className={`${listPageStyles.statIcon} ${listPageStyles.statIconEmerald}`}
                              />
                            </div>
                            <div>
                              <p className={listPageStyles.statLabel}>
                                Questions
                              </p>
                              <p className={listPageStyles.statValue}>
                                {tech.questions}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Upload Date */}
                      <div
                        className={`${listPageStyles.statCardBase} ${listPageStyles.statCardDate}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`${listPageStyles.statIconBox} ${listPageStyles.statIconBoxPurple}`}
                          >
                            <Calendar
                              className={`${listPageStyles.statIcon} ${listPageStyles.statIconPurple}`}
                            />
                          </div>
                          <div>
                            <p className={listPageStyles.statLabel}>Uploaded</p>
                            <p className={listPageStyles.statValue}>
                              {formatUploadDate(tech.uploadDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className={listPageStyles.cardFooter}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openQuestionManager(tech)}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Manage Questions
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              open: true,
                              techId: tech.id,
                              techName: tech.name,
                            })
                          }
                          className={listPageStyles.deleteButton}
                        >
                          <Trash2 className={listPageStyles.trashIcon} />
                          <span className={listPageStyles.deleteText}>
                            Delete
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/*empty state */}
          {filteredTechnologies.length == 0 && (
            <div className={listPageStyles.emptyContainer}>
              <div className={listPageStyles.emptyBlurWrapper}>
                <div className={listPageStyles.emptyBlurCircle}></div>
              </div>
              <div className={listPageStyles.emptyContent}>
                <div className={listPageStyles.emptyIconBox}>
                  <FileText className={listPageStyles.emptyIcon} />
                </div>
                <h3 className={listPageStyles.title}>
                  No technologies found...🤷‍♂️
                </h3>
                <p className={listPageStyles.emptyText}>
                  {searchTerm || selectedLevel !== "All"
                    ? "Try adjusting your search or filter to find what you're looking for."
                    : "Get Started by creating your first technology quiz"}
                </p>
                <a href="/dashboard" className={listPageStyles.emptyButton}>
                  <Plus className={listPageStyles.emptyButtonIcon} />
                  <span className={listPageStyles.emptyButtonText}>
                    Create First Quiz
                  </span>
                </a>
              </div>
            </div>
          )}

          {editingQuiz && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Review & Edit Questions</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {editingQuiz.name}{editingQuiz.subName ? ` · ${editingQuiz.subName}` : ""}
                    </p>
                  </div>
                  <button onClick={() => setEditingQuiz(null)} className="text-slate-500 hover:text-slate-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-5 grid gap-3 rounded-xl bg-blue-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="font-semibold text-blue-900">
                    {editingQuiz.questionItems.length} of {targetQuestionCount} questions
                    {editingQuiz.questionItems.length < targetQuestionCount &&
                      ` · ${targetQuestionCount - editingQuiz.questionItems.length} remaining`}
                  </p>
                  <label className="text-sm font-medium text-blue-900">
                    Target
                    <input
                      type="number"
                      min="1"
                      value={targetQuestionCount}
                      onChange={(e) => setTargetQuestionCount(Math.max(1, Number(e.target.value) || 1))}
                      className="ml-2 w-20 rounded border border-blue-200 bg-white px-2 py-1"
                    />
                  </label>
                </div>

                <div className="mb-5 space-y-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-slate-900">Uploaded Questions</h4>
                    <span className="text-sm text-slate-500">Edit any parsing mistake before saving</span>
                  </div>
                  <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                    {editingQuiz.questionItems.map((question, index) => (
                      <article key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{index + 1}. {question.question}</p>
                            <div className="mt-2 grid gap-1 text-sm text-slate-600 sm:grid-cols-2">
                              {(question.options || []).map((option, optionIndex) => (
                                <span key={optionIndex} className={question.answerKey === ["A", "B", "C", "D"][optionIndex] ? "font-semibold text-emerald-700" : ""}>
                                  {["A", "B", "C", "D"][optionIndex]}. {option}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button onClick={() => editQuestion(question, index)} className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button onClick={() => removeQuestion(index)} className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50">
                              <Trash2 className="h-3.5 w-3.5" /> Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-slate-900">
                      {editingQuestionIndex === null ? "Add Missing Question" : `Edit Question ${editingQuestionIndex + 1}`}
                    </h4>
                    {editingQuestionIndex !== null && (
                      <button onClick={cancelQuestionEdit} className="text-sm font-medium text-slate-600 hover:text-slate-900">Cancel edit</button>
                    )}
                  </div>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion((item) => ({ ...item, question: e.target.value }))}
                    placeholder="Question"
                    rows="2"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                  {newQuestion.options.map((option, index) => (
                    <input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const options = [...newQuestion.options];
                        options[index] = e.target.value;
                        setNewQuestion((item) => ({ ...item, options }));
                      }}
                      placeholder={`Option ${["A", "B", "C", "D"][index]}`}
                      className="w-full rounded-lg border border-slate-300 p-2"
                    />
                  ))}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="text-sm font-medium text-slate-700">
                      Correct answer
                      <select
                        value={newQuestion.answerKey}
                        onChange={(e) => setNewQuestion((item) => ({ ...item, answerKey: e.target.value }))}
                        className="ml-2 rounded border border-slate-300 px-2 py-1"
                      >
                        {["A", "B", "C", "D"].map((letter) => <option key={letter}>{letter}</option>)}
                      </select>
                    </label>
                    <button onClick={addManualQuestion} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                      {editingQuestionIndex === null ? "Add Question" : "Update Question"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setEditingQuiz(null)} className="rounded-lg border px-4 py-2">Cancel</button>
                  <button
                    onClick={saveQuestions}
                    disabled={editingQuiz.questionItems.length < targetQuestionCount}
                    className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save {editingQuiz.questionItems.length} Questions
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Delete Modal */}
          {confirmDelete.open && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
                <h3 className="text-lg font-semibold mb-2">Delete Quiz?</h3>

                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {confirmDelete.techName}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() =>
                      setConfirmDelete({ open: false, techId: null })
                    }
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      deleteTechnology(confirmDelete.techId);
                      setConfirmDelete({ open: false, techId: null });
                    }}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListCompo;
