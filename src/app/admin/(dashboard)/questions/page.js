"use client";
import { useEffect, useState } from "react";
import { Folder, Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import Modal from "@/components/Modal";
import { SubjectForm } from "@/components/Forms";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "create", item: null, saving: false });

  async function fetchSubjects() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subjects");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to fetch");
      setSubjects(json.data || []);
      setFilteredSubjects(json.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(subject =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);

  const openCreate = () => setModal({ open: true, mode: "create", item: null });
  const openEdit = (item) => setModal({ open: true, mode: "edit", item });
  const closeModal = () => setModal({ open: false, mode: "create", item: null });

  async function createOrUpdate(payload) {
    try {
      setModal((m) => ({ ...m, saving: true }));
      const method = modal.mode === "create" ? "POST" : "PUT";
      const url = modal.mode === "create"
        ? "/api/admin/subjects"
        : `/api/admin/subjects/${modal.item.id}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Save failed");
      toast.success(`Subject ${modal.mode === "create" ? "created" : "updated"} successfully`);
      closeModal();
      fetchSubjects();
    } catch (err) {
      toast.error(err.message);
      setModal((m) => ({ ...m, saving: false }));
    }
  }

  async function deleteSubject(id) {
    if (!confirm("Are you sure you want to delete this subject? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      toast.success("Subject deleted successfully");
      fetchSubjects();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-200">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Folder className="text-blue-600 dark:text-blue-400" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Subjects
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Manage your subjects and course materials
                </p>
              </div>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus size={20} /> 
              <span>Add Subject</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="text-lg">Loading subjects...</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} found
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Empty State */}
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Folder className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? "No subjects found" : "No subjects yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? "Try adjusting your search terms or create a new subject."
                    : "Get started by creating your first subject to organize your questions."
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 mx-auto"
                  >
                    <Plus size={20} /> 
                    <span>Create Your First Subject</span>
                  </button>
                )}
              </div>
            ) : (
              /* Subjects Grid */
              <div className="grid gap-4 md:gap-6">
                {filteredSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="group bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <Link 
                        href={`/admin/questions/${sub.id}`}
                        className="flex-1 flex items-start gap-4 hover:no-underline group"
                      >
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                          <Folder className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {sub.name}
                          </h3>
                          {sub.description && (
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                              {sub.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              ID: {sub.id}
                            </span>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="flex gap-2 sm:flex-col sm:gap-1">
                        <button 
                          onClick={() => openEdit(sub)}
                          className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 px-3 py-2 rounded-lg transition-colors duration-200"
                          title="Edit subject"
                        >
                          <Pencil size={16} />
                          <span className="sm:hidden">Edit</span>
                        </button>
                        <button 
                          onClick={() => deleteSubject(sub.id)}
                          className="flex items-center gap-2 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors duration-200"
                          title="Delete subject"
                        >
                          <Trash2 size={16} />
                          <span className="sm:hidden">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal */}
        <Modal
          open={modal.open}
          onClose={closeModal}
          title={`${modal.mode === "create" ? "Add New" : "Edit"} Subject`}
        >
          <SubjectForm
            initial={modal.item}
            saving={modal.saving}
            onCancel={closeModal}
            onSubmit={createOrUpdate}
          />
        </Modal>
      </div>
    </div>
  );
}