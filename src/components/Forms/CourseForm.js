"use client";

import { useState, useEffect } from "react";
import { Save, X, BookOpen } from "lucide-react";

export function CourseForm({ initial, saving, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description || "");
    }
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ name, description });
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <div className="w-full mx-auto">
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <BookOpen className="text-white" size={28} />
          </div>
        </div>

        {/* Form Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {initial ? "Edit Course" : "Create New Course"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {initial ? "Update your course details" : "Add a new course to your catalog"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Course Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter course name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <div className="relative">
              <textarea
                placeholder="Describe what students will learn..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm resize-none"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {description.length}/500
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-sm hover:shadow transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {initial ? "Update" : "Create"} Course
                </>
              )}
            </button>
          </div>

          {/* Form Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              <strong>Tip:</strong> Make your course name clear and descriptive to help students find what they need.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}