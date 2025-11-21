"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Image, Settings } from "lucide-react";
import toast from "react-hot-toast";

// Custom scrollbar styles (same as before)
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
  }
  .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
  
  .textarea-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .textarea-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .textarea-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  .textarea-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  .dark .textarea-scrollbar::-webkit-scrollbar-thumb {
    background: #475569;
  }
  .dark .textarea-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #64748b;
  }
`;

// Inject custom scrollbar styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = scrollbarStyles;
  document.head.appendChild(styleSheet);
}

/* Small inputs used across forms */
function TextInput({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3, placeholder = "" }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical textarea-scrollbar overflow-y-auto"
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QuestionForm({ initial = null, parent = {}, onCancel, onSubmit, saving = false }) {
  const [question_text, setQuestionText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [question_image_url, setQuestionImageUrl] = useState("");
  const [image_url, setExplanationImageUrl] = useState("");
  const [status, setStatus] = useState("pending");
  const [correct_key, setCorrectKey] = useState("");
  const [options, setOptions] = useState([
    { option_key: "a", content: "" },
    { option_key: "b", content: "" },
    { option_key: "c", content: "" },
    { option_key: "d", content: "" },
    { option_key: "e", content: "" },
    { option_key: "f", content: "" },
    { option_key: "g", content: "" },
    { option_key: "h", content: "" },
  ]);

  // Initialize form with initial data
  useEffect(() => {
    if (initial) {
      console.log("Initial data:", initial);
      setQuestionText(initial.question_text || "");
      setExplanation(initial.explanation || "");
      setQuestionImageUrl(initial.question_image_url || "");
      setExplanationImageUrl(initial.image_url || "");
      setStatus(initial.status || "pending");
      setCorrectKey(initial.correct_answers?.correct_key || "");

      // Handle options initialization for A-H
      if (initial.question_options && initial.question_options.length > 0) {
        const initializedOptions = ["a", "b", "c", "d", "e", "f", "g", "h"].map((key) => {
          const foundOption = initial.question_options.find(opt => opt.option_key === key);
          return {
            option_key: key,
            content: foundOption ? foundOption.content : ""
          };
        });
        console.log("Initialized options:", initializedOptions);
        setOptions(initializedOptions);
      } else {
        setOptions([
          { option_key: "a", content: "" },
          { option_key: "b", content: "" },
          { option_key: "c", content: "" },
          { option_key: "d", content: "" },
          { option_key: "e", content: "" },
          { option_key: "f", content: "" },
          { option_key: "g", content: "" },
          { option_key: "h", content: "" },
        ]);
      }
    } else {
      // Reset form for create mode
      setQuestionText("");
      setExplanation("");
      setQuestionImageUrl("");
      setExplanationImageUrl("");
      setStatus("pending");
      setCorrectKey("");
      setOptions([
        { option_key: "a", content: "" },
        { option_key: "b", content: "" },
        { option_key: "c", content: "" },
        { option_key: "d", content: "" },
        { option_key: "e", content: "" },
        { option_key: "f", content: "" },
        { option_key: "g", content: "" },
        { option_key: "h", content: "" },
      ]);
    }
  }, [initial]);

  function updateOptionContent(key, val) {
    setOptions((prev) => prev.map((o) => (o.option_key === key ? { ...o, content: val } : o)));
  }

  const submit = (e) => {
    e.preventDefault();

    if (!question_text.trim()) return toast.error("Question text is required");

    // collect non-empty options
    const normalized = options
      .map((o) => ({ option_key: o.option_key, content: String(o.content || "").trim() }))
      .filter((o) => o.content);

    if (normalized.length < 2) return toast.error("At least two options are required");

    // if correct_key provided, validate it (now supports A-H)
    const ck = (String(correct_key || "")).toLowerCase();
    if (ck && !["a", "b", "c", "d", "e", "f", "g", "h"].includes(ck)) {
      return toast.error("Correct key must be a letter from A to H");
    }

    // build payload
    const payload = {
      subject_id: parent?.subject_id || initial?.subject_id || null,
      chapter_id: parent?.chapter_id || initial?.chapter_id || null,
      topic_id: parent?.topic_id !== undefined ? parent.topic_id : initial?.topic_id || null,
      question_text: question_text.trim(),
      explanation: explanation?.trim() || null,
      question_image_url: question_image_url?.trim() || null,
      image_url: image_url?.trim() || null,
      status: status,
      options: normalized,
      correct_key: ck || null,
    };

    console.log("Submitting payload:", payload);
    onSubmit(payload);
  };

  const statusOptions = [
    { value: "pending", label: "🟡 Pending" },
    { value: "approved", label: "🟢 Approved" },
    { value: "rejected", label: "🔴 Rejected" }
  ];

  // Generate correct answer options dynamically based on available options
  const availableOptions = options.filter(opt => opt.content.trim());
  const correctAnswerOptions = [
    { value: "", label: "Select correct option" },
    ...availableOptions.map(opt => ({
      value: opt.option_key,
      label: `Option ${opt.option_key.toUpperCase()}`
    }))
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form onSubmit={submit} className="space-y-6 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initial ? "Edit Question" : "Create New Question"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {initial ? "Update the question details" : "Add a new question with options and explanation"}
          </p>
        </div>

        <div className="space-y-6">
          {/* Question Text */}
          <TextArea 
            label="Question Text *" 
            value={question_text} 
            onChange={setQuestionText} 
            rows={4}
            placeholder="Enter your question here..."
          />

          {/* Question Image URL */}
          <div>
            <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Image size={16} />
              Question Image URL
            </div>
            <input
              value={question_image_url}
              onChange={(e) => setQuestionImageUrl(e.target.value)}
              placeholder="https://example.com/question-image.jpg"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {question_image_url && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This image will be displayed with the question
              </p>
            )}
          </div>

          {/* Options Grid - Now 8 options */}
          <div>
            <div className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
              Options * (At least 2 required, supports up to 8 options A-H)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((opt) => (
                <div key={opt.option_key} className="relative">
                  <div className={`absolute -top-2 left-3 px-2 text-xs font-medium rounded-full z-10 ${
                    opt.content.trim() 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}>
                    Option {opt.option_key.toUpperCase()}
                  </div>
                  <input
                    value={opt.content}
                    onChange={(e) => updateOptionContent(opt.option_key, e.target.value)}
                    placeholder={`Enter option ${opt.option_key.toUpperCase()}...`}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Only options with content will be saved. Options A and B are required.
            </p>
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Settings size={16} />
                Correct Answer *
              </div>
              <select
                value={correct_key}
                onChange={(e) => setCorrectKey(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {correctAnswerOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {correct_key && !availableOptions.some(opt => opt.option_key === correct_key) && (
                <p className="text-xs text-red-500 mt-1">
                  Selected option is empty. Please add content to this option.
                </p>
              )}
            </div>

            <div>
              <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Settings size={16} />
                Status
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Explanation */}
          <TextArea 
            label="Explanation" 
            value={explanation} 
            onChange={setExplanation} 
            rows={4}
            placeholder="Enter detailed explanation for the correct answer (optional)..."
          />

          {/* Explanation Image URL */}
          <div>
            <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Image size={16} />
              Explanation Image URL
            </div>
            <input
              value={image_url}
              onChange={(e) => setExplanationImageUrl(e.target.value)}
              placeholder="https://example.com/explanation-image.jpg"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {image_url && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This image will be displayed with the explanation
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={saving}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{initial ? "Update" : "Create"} Question</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* -----------------------
   Subject Form
   ----------------------- */
export function SubjectForm({ initial = null, onCancel, onSubmit, saving = false }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");

  useEffect(() => {
    setName(initial?.name || "");
    setDescription(initial?.description || "");
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Subject name is required");
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={submit} className="space-y-6 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initial ? "Edit Subject" : "Create New Subject"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {initial ? "Update the subject details" : "Add a new subject to organize your content"}
          </p>
        </div>

        <div className="space-y-4">
          <TextInput 
            label="Subject Name" 
            value={name} 
            onChange={setName} 
            placeholder="Enter subject name"
          />
          <TextArea 
            label="Description" 
            value={description} 
            onChange={setDescription} 
            rows={3}
            placeholder="Enter subject description (optional)"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={saving}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{initial ? "Update" : "Create"} Subject</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* -----------------------
   Chapter Form
   ----------------------- */
export function ChapterForm({ initial = null, parentSubjectId = "", onCancel, onSubmit, saving = false }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");

  useEffect(() => {
    setName(initial?.name || "");
    setDescription(initial?.description || "");
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Chapter name is required");
    onSubmit({ name: name.trim(), description: description.trim(), subject_id: parentSubjectId });
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={submit} className="space-y-6 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initial ? "Edit Chapter" : "Create New Chapter"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {initial ? "Update the chapter details" : "Add a new chapter to organize your questions"}
          </p>
        </div>

        <div className="space-y-4">
          <TextInput 
            label="Chapter Name" 
            value={name} 
            onChange={setName} 
            placeholder="Enter chapter name"
          />
          <TextArea 
            label="Description" 
            value={description} 
            onChange={setDescription} 
            rows={3}
            placeholder="Enter chapter description (optional)"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={saving}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{initial ? "Update" : "Create"} Chapter</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* -----------------------
   Topic Form
   ----------------------- */
export function TopicForm({ initial = null, parentChapterId = "", onCancel, onSubmit, saving = false }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");

  useEffect(() => {
    setName(initial?.name || "");
    setDescription(initial?.description || "");
  }, [initial]);

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Topic name is required");
    onSubmit({ name: name.trim(), description: description.trim(), chapter_id: parentChapterId });
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={submit} className="space-y-6 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initial ? "Edit Topic" : "Create New Topic"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {initial ? "Update the topic details" : "Add a new topic to organize your questions"}
          </p>
        </div>

        <div className="space-y-4">
          <TextInput 
            label="Topic Name" 
            value={name} 
            onChange={setName} 
            placeholder="Enter topic name"
          />
          <TextArea 
            label="Description" 
            value={description} 
            onChange={setDescription} 
            rows={3}
            placeholder="Enter topic description (optional)"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={saving}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{initial ? "Update" : "Create"} Topic</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}