"use client";

import { useEffect, useState } from "react";
import {
  Folder,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Loader2,
  BookOpen,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { TopicForm, QuestionForm } from "@/components/Forms";
import { useParams } from "next/navigation";

export default function ChapterDetailsPage() {
  const { subjectId, chapterId } = useParams();

  const [chapter, setChapter] = useState(null);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showExplanation, setShowExplanation] = useState({});
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "", // "topic" or "question"
    mode: "create", // create/update
    item: null,
    parent: null,
  });

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleExplanation = (questionId) => {
    setShowExplanation((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/chapters/${chapterId}/topics`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setChapter(json.chapter);
      setTopics(json.topics || []);
      setQuestions(json.questions || []);
      setFilteredQuestions(json.questions || []);
      setFilteredTopics(json.topics || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [chapterId]);

  // Apply search and filter
  useEffect(() => {
    let filteredDirectQuestions = questions;
    let filteredTopicQuestions = topics.map((topic) => ({
      ...topic,
      questions: topic.questions || [],
    }));

    // Apply search filter to direct questions
    if (searchTerm) {
      filteredDirectQuestions = questions.filter(
        (q) =>
          q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.explanation?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Apply search filter to topic questions
      filteredTopicQuestions = topics.map((topic) => ({
        ...topic,
        questions: (topic.questions || []).filter(
          (q) =>
            q.question_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.explanation?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }));
    }

    // Apply status filter to direct questions
    if (statusFilter !== "all") {
      filteredDirectQuestions = filteredDirectQuestions.filter(
        (q) => q.status === statusFilter
      );

      // Apply status filter to topic questions
      filteredTopicQuestions = filteredTopicQuestions.map((topic) => ({
        ...topic,
        questions: topic.questions.filter((q) => q.status === statusFilter),
      }));
    }

    setFilteredQuestions(filteredDirectQuestions);
    setFilteredTopics(filteredTopicQuestions);
  }, [searchTerm, statusFilter, questions, topics]);

  // Open modal
  const openModal = (type, mode, item = null, parent = null) => {
    setModal({ open: true, type, mode, item, parent });
  };

  const closeModal = () =>
    setModal({
      open: false,
      type: "",
      mode: "create",
      item: null,
      parent: null,
    });

  // API Callers with loading states
  async function deleteTopic(id) {
    if (
      !confirm(
        "Are you sure you want to delete this topic? All questions under this topic will also be deleted."
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/topics/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Topic deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function deleteQuestion(id) {
    if (
      !confirm(
        "Are you sure you want to delete this question? This action cannot be undone."
      )
    )
      return;
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Question deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  }

  // Handle form submissions with loading states
  const handleTopicSubmit = async (payload) => {
    setSaving(true);
    try {
      const url =
        modal.mode === "create"
          ? "/api/admin/topics"
          : `/api/admin/topics/${modal.item.id}`;

      const method = modal.mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }

      toast.success(
        modal.mode === "create"
          ? "Topic created successfully!"
          : "Topic updated successfully!"
      );
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionSubmit = async (payload) => {
    setSaving(true);
    try {
      const url =
        modal.mode === "create"
          ? "/api/admin/questions"
          : `/api/admin/questions/${modal.item.id}`;

      const method = modal.mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        toast.error(json.error);
        return;
      }

      toast.success(
        modal.mode === "create"
          ? "Question added successfully!"
          : "Question updated successfully!"
      );
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "rejected":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  // Calculate stats based on filtered data
  const totalFilteredQuestions =
    filteredQuestions.length +
    filteredTopics.reduce((total, topic) => total + topic.questions.length, 0);

  const approvedFilteredQuestions =
    filteredQuestions.filter((q) => q.status === "approved").length +
    filteredTopics.reduce(
      (total, topic) =>
        total + topic.questions.filter((q) => q.status === "approved").length,
      0
    );

  const pendingFilteredQuestions =
    filteredQuestions.filter((q) => q.status === "pending").length +
    filteredTopics.reduce(
      (total, topic) =>
        total + topic.questions.filter((q) => q.status === "pending").length,
      0
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6 transition-colors duration-200">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
            <div className="flex-1">
              {/* Back Button */}
              <Link
                href={`/admin/questions/${subjectId}`}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-all duration-200 mb-6 group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span className="font-medium">Back to Chapters</span>
              </Link>

              {/* Chapter Title */}
              <div className="flex items-center gap-4 mb-2">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <Folder
                    className="text-blue-600 dark:text-blue-400"
                    size={36}
                  />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {chapter?.name || "Loading..."}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Manage topics and questions for this chapter
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 h-fit">
              <button
                onClick={() => openModal("topic", "create")}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Add Topic</span>
              </button>
              <button
                onClick={() =>
                  openModal("question", "create", null, {
                    subject_id: subjectId,
                    chapter_id: chapterId,
                    topic_id: null,
                  })
                }
                className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search questions by text or explanation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                {(searchTerm || statusFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText
                    className="text-blue-600 dark:text-blue-400"
                    size={16}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Filtered Questions
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {totalFilteredQuestions}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2
                    className="text-green-600 dark:text-green-400"
                    size={16}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Approved
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {approvedFilteredQuestions}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock
                    className="text-yellow-600 dark:text-yellow-400"
                    size={16}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {pendingFilteredQuestions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-lg">Loading chapter content...</p>
          </div>
        ) : (
          <>
            {/* Direct Chapter Questions */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FileText
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                  Direct Questions
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {filteredQuestions.length} questions
                  </span>
                </h2>
              </div>

              {filteredQuestions.length > 0 ? (
                <div className="grid gap-4">
                  {filteredQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      showExplanation={showExplanation[q.id]}
                      onToggleExplanation={() => toggleExplanation(q.id)}
                      onEdit={() =>
                        openModal("question", "edit", q, {
                          subject_id: subjectId,
                          chapter_id: chapterId,
                          topic_id: null,
                        })
                      }
                      onDelete={() => deleteQuestion(q.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                  <FileText
                    className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                    size={48}
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {searchTerm || statusFilter !== "all"
                      ? "No matching direct questions"
                      : "No direct questions yet"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start by adding questions directly to this chapter."}
                  </p>
                  {!(searchTerm || statusFilter !== "all") && (
                    <button
                      onClick={() =>
                        openModal("question", "create", null, {
                          subject_id: subjectId,
                          chapter_id: chapterId,
                          topic_id: null,
                        })
                      }
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 mx-auto"
                    >
                      <Plus size={20} />
                      <span>Add First Question</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Topics Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Folder
                    className="text-indigo-600 dark:text-indigo-400"
                    size={24}
                  />
                  Topics
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {
                      filteredTopics.filter(
                        (topic) => topic.questions.length > 0
                      ).length
                    }{" "}
                    topics with questions
                  </span>
                </h2>
              </div>

              {filteredTopics.filter((topic) => topic.questions.length > 0)
                .length > 0 ? (
                <div className="space-y-4">
                  {filteredTopics
                    .filter((topic) => topic.questions.length > 0)
                    .map((topic) => (
                      <TopicAccordion
                        key={topic.id}
                        topic={topic}
                        subjectId={subjectId}
                        chapterId={chapterId}
                        isExpanded={expanded[topic.id]}
                        onToggle={() => toggle(topic.id)}
                        onEdit={() => openModal("topic", "edit", topic)}
                        onDelete={() => deleteTopic(topic.id)}
                        onAddQuestion={() =>
                          openModal("question", "create", null, {
                            subject_id: subjectId,
                            chapter_id: chapterId,
                            topic_id: topic.id,
                          })
                        }
                        showExplanation={showExplanation}
                        onToggleExplanation={toggleExplanation}
                        openModal={openModal}
                        deleteQuestion={deleteQuestion}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                  <Folder
                    className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                    size={48}
                  />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {searchTerm || statusFilter !== "all"
                      ? "No topics with matching questions"
                      : topics.length === 0
                      ? "No topics yet"
                      : "No questions in topics"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : topics.length === 0
                      ? "Organize your questions by creating topics."
                      : "Add questions to your existing topics."}
                  </p>
                  {!(searchTerm || statusFilter !== "all") &&
                    topics.length === 0 && (
                      <button
                        onClick={() => openModal("topic", "create")}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 mx-auto"
                      >
                        <Plus size={20} />
                        <span>Create First Topic</span>
                      </button>
                    )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Modals */}
        <Modal
          open={modal.open}
          title={
            <div className="flex items-center gap-3">
              {modal.type === "topic" ? (
                <Folder className="text-indigo-600" size={24} />
              ) : (
                <FileText className="text-green-600" size={24} />
              )}
              {modal.mode === "create"
                ? `Add New ${modal.type}`
                : `Edit ${modal.type}`}
            </div>
          }
          onClose={closeModal}
          size={modal.type === "question" ? "2xl" : "xl"}
        >
          {modal.type === "topic" && (
            <TopicForm
              initial={modal.mode === "edit" ? modal.item : null}
              parentChapterId={chapterId}
              onCancel={closeModal}
              onSubmit={handleTopicSubmit}
              saving={saving}
            />
          )}

          {modal.type === "question" && (
            <QuestionForm
              initial={modal.mode === "edit" ? modal.item : null}
              parent={modal.parent}
              onCancel={closeModal}
              onSubmit={handleQuestionSubmit}
              saving={saving}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}

// Question Card Component (same as before)
function QuestionCard({
  question,
  showExplanation,
  onToggleExplanation,
  onEdit,
  onDelete,
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "rejected":
        return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      default:
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const correctAnswer = question.correct_answers?.correct_key;
  const correctOption = question.question_options?.find(
    (opt) => opt.option_key === correctAnswer
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
      {/* Question Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <FileText className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                question.status
              )}`}
            >
              {getStatusIcon(question.status)}
              {question.status || "pending"}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              {question?.status_user?.full_name || "Waiting for approved"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleExplanation}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            {showExplanation ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="text-sm">
              {showExplanation ? "Hide" : "Show"} Explanation
            </span>
          </button>
          <button
            onClick={onEdit}
            className="text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-2 rounded-lg transition-colors"
            title="Edit question"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
            title="Delete question"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 leading-relaxed">
          {question.question_text}
        </h3>

        {/* Question Image */}
        {question.question_image_url && (
          <div className="mb-4">
            <a
              href={question.question_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <FileText size={16} />
              View Question Image
            </a>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-2 mb-4">
        {question.question_options?.map((option) => (
          <div
            key={option.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              option.option_key === correctAnswer
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
            }`}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                option.option_key === correctAnswer
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              {option.option_key}
            </div>
            <span className="text-gray-900 dark:text-white flex-1">
              {option.content}
            </span>
            {option.option_key === correctAnswer && (
              <CheckCircle2
                className="text-green-600 flex-shrink-0"
                size={16}
              />
            )}
          </div>
        ))}
      </div>

      {/* Correct Answer */}
      {correctOption && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <CheckCircle2 size={16} />
            <span className="font-medium">Correct Answer:</span>
            <span>{correctOption.content}</span>
          </div>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <FileText size={16} />
            Explanation
          </h4>
          <p className="text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-line">
            {question.explanation}
          </p>
          {question.explanation_image_url && (
            <div className="mt-3">
              <a
                href={question.explanation_image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <FileText size={16} />
                View Explanation Image
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Topic Accordion Component (updated to use filtered questions)
function TopicAccordion({
  topic,
  subjectId,
  chapterId,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddQuestion,
  showExplanation,
  onToggleExplanation,
  openModal,
  deleteQuestion,
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300">
      {/* Topic Header */}
      <div
        className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-2xl transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            {isExpanded ? (
              <ChevronDown
                className="text-indigo-600 dark:text-indigo-400"
                size={20}
              />
            ) : (
              <ChevronRight
                className="text-indigo-600 dark:text-indigo-400"
                size={20}
              />
            )}
          </div>
          <Folder className="text-indigo-600 dark:text-indigo-400" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {topic.name}
            </h3>
            {topic.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {topic.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            {topic.questions?.length || 0} questions
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddQuestion();
            }}
            className="text-green-600 dark:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg transition-colors"
            title="Add question to topic"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 p-2 rounded-lg transition-colors"
            title="Edit topic"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
            title="Delete topic"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Topic Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {topic.questions?.length > 0 ? (
            <div className="grid gap-4">
              {topic.questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  showExplanation={showExplanation[question.id]}
                  onToggleExplanation={() => onToggleExplanation(question.id)}
                  onEdit={() =>
                    openModal("question", "edit", question, {
                      subject_id: subjectId,
                      chapter_id: chapterId,
                      topic_id: topic.id,
                    })
                  }
                  onDelete={() => deleteQuestion(question.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="mx-auto mb-2" size={32} />
              <p>No questions in this topic yet.</p>
              <button
                onClick={onAddQuestion}
                className="mt-3 text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
              >
                Add the first question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
