"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  BookOpen,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Upload,
  Shield,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Custom Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, doctor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Delete Doctor
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              This action cannot be undone
            </p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            Are you sure you want to delete{" "}
            <strong>Dr. {doctor?.full_name}</strong>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This will permanently remove the doctor and all their subject
            assignments from the system.
          </p>

          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Warning
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  All associated data including subject assignments will be
                  permanently deleted.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors border border-gray-300 dark:border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
          >
            <Trash2 className="w-4 h-4" />
            Delete Doctor
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Doctor Form Modal Component
const DoctorFormModal = ({ isOpen, onClose, doctor, onSubmit, subjects }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    is_active: true,
    subject_ids: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        full_name: doctor.full_name || "",
        email: doctor.email || "",
        password: "",
        is_active: doctor.is_active ?? true,
        subject_ids: doctor.subjects?.map((s) => s.id) || [],
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        password: "",
        is_active: true,
        subject_ids: [],
      });
    }
  }, [doctor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      subject_ids: prev.subject_ids.includes(subjectId)
        ? prev.subject_ids.filter((id) => id !== subjectId)
        : [...prev.subject_ids, subjectId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {doctor ? "Edit Doctor" : "Add New Doctor"}
              </h2>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {doctor
                  ? "Update doctor information"
                  : "Create a new medical professional account"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-colors"
          >
            <span className="text-2xl text-gray-500 dark:text-gray-400">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Dr. John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="doctor@hospital.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password {doctor ? "(leave blank to keep current)" : "*"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required={!doctor}
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-12 transition-colors"
                placeholder={
                  doctor ? "Enter new password" : "Create secure password"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {!doctor && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                🔒 Password must be at least 8 characters with uppercase,
                lowercase, number, and special character
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Assign Specializations
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              {subjects.map((subject) => (
                <label
                  key={subject.id}
                  className="flex items-start space-x-3 p-3 hover:bg-white dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <input
                    type="checkbox"
                    checked={formData.subject_ids.includes(subject.id)}
                    onChange={() => toggleSubject(subject.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
                      {subject.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                      Course: {subject.course_name}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Active Account - Doctor can login and access the system
            </label>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors border border-gray-300 dark:border-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserCheck className="w-5 h-5" />
            )}
            {doctor ? "Update Doctor" : "Create Doctor"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Doctor Card Component
const DoctorCard = ({ doctor, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                doctor.is_active
                  ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-500/25"
                  : "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-gray-500/25"
              }`}
            >
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                {doctor.full_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {doctor.email}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors group/menu"
            >
              <MoreVertical className="w-5 h-5 text-gray-400 group-hover/menu:text-gray-600 dark:group-hover/menu:text-gray-300" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      onEdit(doctor);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Doctor
                  </button>
                  <button
                    onClick={() => {
                      onDelete(doctor);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Doctor
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
                doctor.is_active
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600"
              }`}
            >
              {doctor.is_active ? (
                <UserCheck className="w-3 h-3" />
              ) : (
                <UserX className="w-3 h-3" />
              )}
              <span className="text-xs font-semibold">
                {doctor.is_active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600">
              <BookOpen className="w-3 h-3" />
              <span className="text-xs font-semibold">
                {doctor.subjects?.length || 0} subjects
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
            Joined {new Date(doctor.created_at).toLocaleDateString()}
          </div>
        </div>

        {doctor.subjects && doctor.subjects.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Specializations
            </p>
            <div className="flex flex-wrap gap-2">
              {doctor.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="group relative"
                  title={`${subject.name} (${subject.course_name})`}
                >
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800 shadow-sm">
                    {subject.name}
                  </span>
                  {/* Tooltip with course info */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {subject.course_name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-6">
      <div className="flex justify-between sm:justify-between w-full items-center">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Showing page <span className="font-semibold">{currentPage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <div className="hidden sm:flex space-x-1">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalDoctors: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    loadDoctors();
    loadSubjects();
  }, [pagination.currentPage, searchTerm, statusFilter]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "9",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/doctors/get?${params}`);
      const data = await response.json();

      if (data.success) {
        setDoctors(data.doctors);
        setPagination(data.pagination);
      } else {
        console.error("Failed to load doctors:", data.error);
        toast.error("Failed to load doctors");
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
      toast.error("Error loading doctors");
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const response = await fetch("/api/admin/subjects/get");
      const data = await response.json();
 
      if (data.success) {
        console.log("Loaded subjects:", data.subjects);
        setSubjects(data.subjects);
      } else {
        toast.error("Failed to load subjects");
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast.error("Error loading subjects");
    }
  };

  const handleCreateDoctor = async (formData) => {
    const loadingToast = toast.loading("Creating doctor...");

    try {
      const response = await fetch("/api/admin/doctors/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.dismiss(loadingToast);
        await loadDoctors();

        if (data.plainPassword) {
          toast.success(
            <div>
              <p className="font-semibold">Doctor created successfully! 🎉</p>
              <p className="text-sm mt-1">
                Temporary password: <strong>{data.plainPassword}</strong>
              </p>
              <p className="text-xs mt-1 text-gray-600">
                Share this with the doctor and ask them to change it
                immediately.
              </p>
            </div>,
            { duration: 8000 }
          );
        } else {
          toast.success("Doctor created successfully!");
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error(`Failed to create doctor: ${data.error}`);
        throw new Error(data.error);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create doctor");
      throw error;
    }
  };

  const handleUpdateDoctor = async (formData) => {
    const loadingToast = toast.loading("Updating doctor...");

    try {
      const response = await fetch("/api/admin/doctors/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingDoctor.id }),
      });

      const data = await response.json();

      if (data.success) {
        toast.dismiss(loadingToast);
        await loadDoctors();
        toast.success("Doctor updated successfully! ✅");
      } else {
        toast.dismiss(loadingToast);
        toast.error(`Failed to update doctor: ${data.error}`);
        throw new Error(data.error);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update doctor");
      throw error;
    }
  };

  const handleDeleteDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoctor) return;

    const loadingToast = toast.loading("Deleting doctor...");

    try {
      const response = await fetch(
        `/api/admin/doctors/delete?id=${selectedDoctor.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.dismiss(loadingToast);
        await loadDoctors();
        toast.success(`Dr. ${selectedDoctor.full_name} deleted successfully!`);
        setShowConfirmModal(false);
        setSelectedDoctor(null);
      } else {
        toast.dismiss(loadingToast);
        toast.error(`Failed to delete doctor: ${data.error}`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error deleting doctor:", error);
      toast.error("Error deleting doctor");
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  if (loading && doctors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Toaster position="top-right" />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">
            Loading Medical Team...
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Fetching doctor records
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
          success: {
            duration: 5000,
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
          },
          error: {
            duration: 6000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "white",
            },
          },
          loading: {
            duration: Infinity,
          },
        }}
      />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              Manage Medical Team
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">
                Manage doctors and their specializations
              </p>
            </div>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Add New Doctor
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Doctors</p>
              <p className="text-3xl font-bold mt-2">
                {pagination.totalDoctors}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active</p>
              <p className="text-3xl font-bold mt-2">
                {doctors.filter((d) => d.is_active).length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm font-medium">Inactive</p>
              <p className="text-3xl font-bold mt-2">
                {doctors.filter((d) => !d.is_active).length}
              </p>
            </div>
            <UserX className="w-8 h-8 text-gray-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">
                Avg. Specializations
              </p>
              <p className="text-3xl font-bold mt-2">
                {doctors.length > 0
                  ? Math.round(
                      doctors.reduce(
                        (acc, doc) => acc + (doc.subjects?.length || 0),
                        0
                      ) / doctors.length
                    )
                  : 0}
              </p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search doctors by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {doctors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <Users className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No doctors found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchTerm || statusFilter !== "all"
              ? "No doctors match your search criteria. Try adjusting your filters."
              : "Start building your medical team by adding the first doctor."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold text-lg flex items-center gap-3 transition-all duration-200 shadow-lg shadow-blue-500/25 mx-auto"
            >
              <Plus className="w-6 h-6" />
              Add Your First Doctor
            </motion.button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onEdit={(doc) => {
                  setEditingDoctor(doc);
                  setShowForm(true);
                }}
                onDelete={handleDeleteDoctor}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <DoctorFormModal
            isOpen={showForm}
            onClose={() => {
              setShowForm(false);
              setEditingDoctor(null);
            }}
            doctor={editingDoctor}
            onSubmit={editingDoctor ? handleUpdateDoctor : handleCreateDoctor}
            subjects={subjects}
          />
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false);
              setSelectedDoctor(null);
            }}
            onConfirm={confirmDelete}
            doctor={selectedDoctor}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
