"use client";

import { useState } from "react";
import Papa from "papaparse";
import toast, { Toaster } from "react-hot-toast";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Database,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function BulkUploadPage() {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [headers, setHeaders] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Normalize keys: converts "Correct Answer" -> "correct_answer"
  const normalizeKey = (key) =>
    key
      ?.toLowerCase()
      ?.trim()
      ?.replaceAll(" ", "_")
      ?.replaceAll(".", "")
      ?.replaceAll("-", "_")
      ?.replaceAll("__", "_");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    const loadingToast = toast.loading("Parsing CSV file...");
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // 🔥 Decode CSV as UTF-8 ALWAYS (fixes Î” / Ã—)
        let csvText = new TextDecoder("utf-8").decode(e.target.result);

        // 🔥 Remove BOM if present (special Excel character)
        if (csvText.charCodeAt(0) === 0xfeff) {
          csvText = csvText.slice(1);
        }

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          encoding: "UTF-8",
          // 🔥 force Papa to treat everything as string
          transform: (value) =>
            typeof value === "string" ? value.normalize("NFC") : String(value),

          complete: (result) => {
            toast.dismiss(loadingToast);

            if (!result.data || result.data.length === 0) {
              toast.error("Empty CSV or invalid format");
              return;
            }

            const firstRow = result.data[0];
            const normalizedHeaders = Object.keys(firstRow).map(normalizeKey);
            setHeaders(normalizedHeaders);

            console.log("🧠 Detected headers:", normalizedHeaders);
            console.log("🧩 First row:", firstRow);

            const parsed = result.data.map((raw, i) => {
              const normalized = {};

              // 🔥 Normalize every cell safely
              for (const k in raw) {
                normalized[normalizeKey(k)] = String(raw[k] || "")
                  .normalize("NFC")
                  .trim();
              }

              // ---- Handle Correct Answer ----
              let correct = (
                normalized.correct_option ||
                normalized.correct_answer ||
                normalized.answer ||
                ""
              )
                .normalize("NFC")
                .trim()
                .toLowerCase();

              // Remove prefix "option a"
              correct = correct
                .replace(/^option\s+/i, "")
                .replace(/[^a-d]/g, "");

              // ---- Try text match if still not valid ----
              if (!["a", "b", "c", "d"].includes(correct)) {
                const normalizeText = (t) =>
                  t
                    ?.toLowerCase()
                    ?.normalize("NFC")
                    ?.replace(/[^a-z0-9\s]/g, "")
                    ?.replace(/\s+/g, " ")
                    ?.trim();

                const optionMap = {
                  a: normalizeText(normalized.option_a),
                  b: normalizeText(normalized.option_b),
                  c: normalizeText(normalized.option_c),
                  d: normalizeText(normalized.option_d),
                };

                const correctText = normalizeText(
                  normalized.correct_option ||
                    normalized.correct_answer ||
                    normalized.answer ||
                    ""
                );

                const matched = Object.entries(optionMap).find(
                  ([, text]) =>
                    text &&
                    (text === correctText ||
                      text.includes(correctText) ||
                      correctText.includes(text))
                );

                if (matched) correct = matched[0];
              }

              return {
                __row: i + 2,
                question_no:
                  normalized.question_no ||
                  normalized.question_number ||
                  normalized["qno"] ||
                  "",
                subject: normalized.subject || normalized.subject_name || "",
                chapter: normalized.chapter || normalized.chapter_name || "",
                topic: normalized.topic || normalized.topic_name || "",
                question_text:
                  normalized.question_text || normalized.question || "",
                question_image_url:
                  normalized.question_image_url ||
                  normalized.question_image ||
                  "",
                option_a: normalized.option_a || normalized.option1 || "",
                option_b: normalized.option_b || normalized.option2 || "",
                option_c: normalized.option_c || normalized.option3 || "",
                option_d: normalized.option_d || normalized.option4 || "",
                correct_option: correct,
                explanation: normalized.explanation || "",
                image_url: normalized.image_url || normalized.image || "",
              };
            });

            // ---- Validate ----
            const errs = [];
            const valid = [];

            parsed.forEach((r) => {
              const rowErrs = [];
              if (!r.subject) rowErrs.push("Missing subject");
              if (!r.chapter) rowErrs.push("Missing chapter");
              if (!r.question_text) rowErrs.push("Missing question text");
              if (!r.option_a || !r.option_b)
                rowErrs.push("Options A & B required");
              if (!["a", "b", "c", "d"].includes(r.correct_option))
                rowErrs.push("Correct answer could not be detected");

              if (rowErrs.length)
                errs.push({ row: r.__row, msg: rowErrs.join(", ") });
              else valid.push(r);
            });

            setErrors(errs);
            setRows(valid);

            if (errs.length) {
              toast.error(`${errs.length} invalid rows found`);
            } else {
              toast.success(`${valid.length} valid questions ready to import`);
            }
          },

          error: (err) => {
            toast.dismiss(loadingToast);
            console.error("CSV parse error:", err);
            toast.error("Error reading CSV file");
          },
        });
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Encoding issue in CSV");
        console.error("Encoding Error:", err);
      }
    };

    reader.readAsArrayBuffer(file); // 👈 MUST be ArrayBuffer for UTF-8 decoding
  };

  const upload = async () => {
    if (rows.length === 0) {
      toast.error("No valid rows to upload");
      return;
    }

    setUploading(true);
    const uploadToast = toast.loading("Uploading questions to database...");

    try {
      const clean = rows.map(({ question_no, ...rest }) => rest);
      // console.log("🚀 Uploading rows:", clean);

      const res = await fetch("/api/admin/questions/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: clean }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.dismiss(uploadToast);
      toast.success(
        <div>
          <p className="font-semibold">🎉 Upload Successful!</p>
          <p className="text-sm mt-1">
            {data.imported} questions imported to database
          </p>
        </div>,
        { duration: 5000 }
      );
      setRows([]);
      setErrors([]);
    } catch (err) {
      toast.dismiss(uploadToast);
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        question_no: "1",
        subject: "Mathematics",
        chapter: "Algebra",
        topic: "Linear Equations",
        question_text: "What is the solution to 2x + 3 = 11?",
        question_image_url: "https://example.com/image.jpg",
        option_a: "x = 4",
        option_b: "x = 5",
        option_c: "x = 6",
        option_d: "x = 7",
        correct_option: "a",
        explanation:
          "Subtract 3 from both sides: 2x = 8, then divide by 2: x = 4",
        image_url: "",
      },
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "question_upload_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Template downloaded successfully!");
  };

  return (
    <div className="min-h-screen  dark:from-gray-900 dark:to-gray-800 p-4 lg:p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
        }}
      />

      <div className=" mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Bulk Upload Questions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Import multiple questions via CSV file
              </p>
            </div>
          </div>

          <button
            onClick={downloadTemplate}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium flex items-center gap-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Upload CSV File
              </h2>

              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Drop your CSV file here
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  or click to browse files
                </p>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Supports CSV files with question data
                </p>
              </div>

              {headers.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📋 Detected Columns:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {headers.map((header, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium"
                      >
                        {header}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            {rows.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-green-500" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Preview Ready
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rows.length} valid questions found
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={upload}
                    disabled={uploading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Database className="w-5 h-5" />
                    )}
                    {uploading
                      ? "Uploading..."
                      : `Import ${rows.length} Questions`}
                  </button>
                </div>

                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                            #
                          </th>
                          <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                            Subject
                          </th>
                          <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                            Chapter
                          </th>
                          <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                            Question
                          </th>
                          <th className="p-4 text-left font-semibold text-gray-900 dark:text-white">
                            Correct
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {rows
                          .slice(0, isExpanded ? rows.length : 5)
                          .map((r, i) => (
                            <tr
                              key={i}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                            >
                              <td className="p-4 font-medium text-gray-900 dark:text-white">
                                {r.question_no || i + 1}
                              </td>
                              <td className="p-4 text-gray-700 dark:text-gray-300">
                                {r.subject}
                              </td>
                              <td className="p-4 text-gray-700 dark:text-gray-300">
                                {r.chapter}
                              </td>
                              <td className="p-4 max-w-[300px]">
                                <p
                                  className="text-gray-700 dark:text-gray-300 truncate"
                                  title={r.question_text}
                                >
                                  {r.question_text}
                                </p>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold uppercase">
                                  {r.correct_option}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {rows.length > 5 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 mx-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show All {rows.length} Questions
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Valid Questions
                  </span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {rows.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Errors Found
                  </span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {errors.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Errors Card */}
            {errors.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-red-200 dark:border-red-800 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Validation Errors
                  </h3>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {errors.map((error, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">
                        Row {error.row}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {error.msg}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                CSV Format Guide
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  • Include headers:{" "}
                  <strong>subject, chapter, question_text</strong>
                </p>
                <p>
                  • Required:{" "}
                  <strong>option_a, option_b, correct_option</strong>
                </p>
                <p>
                  • Correct option: <strong>a, b, c, or d</strong>
                </p>
                <p>• Optional: topic, explanation, image_url</p>
                <p>• Download template for reference</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {rows.length === 0 && errors.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mt-6">
            <Upload className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Ready to Import Questions
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Upload a CSV file to preview and import questions in bulk.
              Download the template to ensure proper formatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
