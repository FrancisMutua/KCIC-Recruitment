import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { IconUpload, IconTrash, IconLoader2, IconFileText, IconCheck } from "@tabler/icons-react";

const Attachments = ({ applicationNo, onBack, onSubmit, loading: savingProfile }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState(null);

  const fetchAttachments = useCallback(async () => {
    try {
      setFetching(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/job/attached-documents?applicationNo=${applicationNo}`, {
        headers: {
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setAttachments(result.data || []);
      } else {
        toast.error(result.message || result.Message || "Failed to fetch attachments");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching attachments");
    } finally {
      setFetching(false);
    }
  }, [applicationNo]);

  useEffect(() => {
    if (applicationNo) {
      fetchAttachments();
    }
  }, [applicationNo, fetchAttachments]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedExtensions = [".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png", ".xlsx", ".xls"];
      const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
      
      if (!allowedExtensions.includes(fileExt)) {
        toast.error("Unsupported file type");
        e.target.value = null;
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        e.target.value = null;
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Content = reader.result.split(',')[1];
        
        const payload = {
          applicationNo,
          fileName: file.name,
          attachment: base64Content,
          tableId: 52178445,
          docType: 3 // Default to Other
        };

        const response = await fetch("/api/job/upload-document", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.accessToken}`
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.success) {
          toast.success("Document uploaded successfully");
          setFile(null);
          document.getElementById("file-input").value = "";
          fetchAttachments();
        } else {
          toast.error(result.message || result.Message || "Upload failed");
        }
        setLoading(false);
      };
      reader.onerror = () => {
        toast.error("Error reading file");
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      toast.error("Error uploading document");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/job/delete-document?id=${id}&applicationNo=${applicationNo}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Document deleted");
        fetchAttachments();
      } else {
        toast.error(result.message || result.Message || "Failed to delete document");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting document");
    }
  };


  return (
    <div className="space-y-8">
      {/* Upload Form */}
      <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <IconUpload size={20} className="text-brand-navy" /> Upload Documents
        </h3>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Document <span className="text-red-500">*</span></label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-navy file:text-brand-navy hover:file:bg-brand-navy cursor-pointer border border-gray-200 rounded-md p-1"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Supported formats: PDF, JPG, PNG, DOCX, XLSX (Max 5MB)</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !file}
            className="flex items-center gap-2 btn-primary px-6 py-2 rounded-md hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? <IconLoader2 className="animate-spin" size={18} /> : <IconUpload size={18} />}
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      </form>

      {/* Attachments List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700">Attached Documents</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extension</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fetching ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <IconLoader2 className="animate-spin" /> Fetching documents...
                    </div>
                  </td>
                </tr>
              ) : attachments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                    No documents attached yet.
                  </td>
                </tr>
              ) : (
                attachments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                       <IconFileText size={18} className="text-gray-400" />
                       {doc.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 uppercase">
                       {doc.fileExtension}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {new Date(doc.documentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete Document"
                      >
                        <IconTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors shadow-sm"
        >
          Previous
        </button>
        <button
          onClick={onSubmit}
          disabled={savingProfile}
          className="flex items-center gap-2 bg-green-600 text-white px-8 py-2 rounded-md hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {savingProfile ? <IconLoader2 className="animate-spin" size={20} /> : <IconCheck size={20} />}
          {savingProfile ? "Saving Profile..." : "Complete Application"}
        </button>
      </div>
    </div>
  );
};

export default Attachments;
