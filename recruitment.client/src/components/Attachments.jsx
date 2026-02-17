import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCloudUploadAlt,
  FaFileAlt,
  FaTrashAlt,
  FaPaperclip,
  FaCheckCircle,
  FaTimes,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaArrowRight,
  FaInbox,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { changeDocumentTitle } from "../scripts/script";

const Attachments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentNo = searchParams.get("documentNo");
  const token = localStorage.getItem("accessToken");

  // State
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileData, setFileData] = useState({
    fileName: "",
    fileExtension: "",
    base64String: "",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/job/getattachments?documentNo=${documentNo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      setAttachments(result);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /* eslint-disable */
  useEffect(() => {
    fetchData();
  }, [documentNo]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    const nameParts = file.name.split(".");
    const extension = nameParts.pop();
    const fileNameWithoutExtension = nameParts.join(".");

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setSelectedFile(file);
      setFileData({
        fileName: fileNameWithoutExtension,
        fileExtension: extension,
        base64String: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileData.base64String) {
      toast.error("Please select a valid file first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...fileData, documentNo, token };
      const response = await fetch("/api/job/uploadattachment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      toast.success("Document uploaded successfully");
      setIsModalOpen(false);
      setSelectedFile(null);
      setFileData({ fileName: "", fileExtension: "", base64String: "" });
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this document?"))
      return;
    try {
      const response = await fetch(`/api/job/removeattachment?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success("Document deleted");
      fetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getFileIcon = (ext) => {
    const e = ext.toLowerCase();
    if (e === "pdf") return <FaFilePdf className="text-red-500" />;
    if (["jpg", "jpeg", "png"].includes(e))
      return <FaFileImage className="text-blue-500" />;
    if (["doc", "docx"].includes(e))
      return <FaFileWord className="text-blue-700" />;
    return <FaFileAlt className="text-gray-400" />;
  };

  useEffect(function () {
    changeDocumentTitle("Document Attachments");
    return () => changeDocumentTitle("KUCCPS Recruitment Portal");
  }, []);

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-700 bg-gray-50/30 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 md:p-2.5 rounded-xl shadow-lg shadow-red-200">
              <FaPaperclip className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#00171f] tracking-tight uppercase">
              Supporting <span className="text-red-600">Documents</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14">
            Upload your CV, Certificates, and other required identification.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-[#00171f] hover:bg-black text-white px-6 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl"
        >
          <FaCloudUploadAlt size={16} /> Upload New File
        </button>
      </div>

      {/* DATA CONTAINER */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
              Syncing History...
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden divide-y divide-gray-100">
              {attachments.length > 0 ? (
                attachments.map((file) => (
                  <div
                    key={file.id}
                    className="p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-3xl flex-shrink-0">
                        {getFileIcon(file.fileExtension)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-[#00171f] text-sm truncate uppercase tracking-tight">
                          {file.fileName}
                        </h4>
                        <span className="text-[9px] font-black text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                          {file.fileExtension}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-3 text-red-500 bg-red-50 rounded-xl transition-all"
                    >
                      <FaTrashAlt size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <EmptyState />
              )}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Type
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      File Name
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Format
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attachments.length > 0 ? (
                    attachments.map((file) => (
                      <tr
                        key={file.id}
                        className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-5 text-2xl">
                          {getFileIcon(file.fileExtension)}
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm md:text-base font-black text-gray-700 group-hover:text-red-600 transition-colors uppercase">
                            {file.fileName}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                            {file.fileExtension}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10}>
                        <EmptyState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-black font-black text-[10px] uppercase tracking-widest transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() =>
            navigate(
              `/app/preview-application?documentNo=${documentNo}&status=Open`,
            )
          }
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl active:scale-95"
        >
          Review Application <FaArrowRight size={12} />
        </button>
      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#00171f]/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm md:text-base font-black text-[#00171f] uppercase tracking-tight">
                Upload <span className="text-red-600">Document</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-600"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 md:p-8 space-y-6">
              <div className="relative">
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                />
                <label
                  htmlFor="fileUpload"
                  className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[1.5rem] cursor-pointer transition-all
                  ${selectedFile ? "border-green-400 bg-green-50/30" : "border-gray-200 bg-gray-50 hover:border-red-300"}`}
                >
                  {selectedFile ? (
                    <div className="text-center animate-in fade-in zoom-in">
                      <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
                      <p className="text-xs font-black text-gray-700 truncate max-w-[200px]">
                        {selectedFile.name}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase font-black mt-1">
                        Change File
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FaCloudUploadAlt className="text-gray-300 text-4xl mx-auto mb-2" />
                      <p className="text-xs font-black text-gray-700">
                        Click to Browse
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase font-black mt-1">
                        PDF, DOC, PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {selectedFile && (
                <div className="space-y-1.5 animate-in slide-in-from-top-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Confirm Filename
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-medium text-sm text-gray-700 outline-none focus:ring-4 focus:ring-red-500/10 transition-all"
                    value={fileData.fileName}
                    onChange={(e) =>
                      setFileData({ ...fileData, fileName: e.target.value })
                    }
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl transition-all disabled:bg-gray-400"
              >
                {isSubmitting ? "Uploading..." : "Complete Upload"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center w-full">
    <div className="bg-gray-50 p-8 rounded-full mb-4 text-gray-200">
      <FaInbox size={48} />
    </div>
    <h3 className="text-base font-black text-gray-700 uppercase tracking-tight mb-1">
      No Attachments
    </h3>
    <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
      Upload your CV and certificates to proceed with your application.
    </p>
  </div>
);

export default Attachments;
