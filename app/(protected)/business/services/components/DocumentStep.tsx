import React, { useState, useRef, useEffect } from "react";
import { FileText, CheckCircleIcon } from "lucide-react";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { StepProps } from "../page";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/solid";
interface UploadedDocument {
  file: File;
  url: string;
  public_id: string;
  isUploading: boolean;
  error?: string;
}

const DocumentsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accepted file types
  const acceptedTypes = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "text/plain": [".txt"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  // ✅ FIXED: Update form data whenever uploadedDocs changes
  useEffect(() => {
    const uploadedUrls = uploadedDocs
      .filter((doc) => doc.url && !doc.isUploading && !doc.error)
      .map((doc) => doc.url);

    console.log(
      "🔄 FormData Effect - Current uploadedDocs:",
      uploadedDocs.map((d) => ({
        name: d.file.name,
        url: d.url,
        isUploading: d.isUploading,
        error: d.error,
      }))
    );
    console.log("🔄 FormData Effect - Extracted URLs:", uploadedUrls);
    console.log(
      "🔄 FormData Effect - Current form documents:",
      formData.documents
    );

    // Update form data if URLs changed
    if (JSON.stringify(formData.documents) !== JSON.stringify(uploadedUrls)) {
      console.log("📝 Updating form data with new URLs:", uploadedUrls);
      updateFormData({ documents: uploadedUrls });
    }
  }, [uploadedDocs]);

  // ✅ FIXED: Validate file
  const validateFile = (file: File): string | null => {
    if (!Object.keys(acceptedTypes).includes(file.type)) {
      return `File type "${file.type}" not supported. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG`;
    }

    if (file.size > maxFileSize) {
      return `File size (${(file.size / 1024 / 1024).toFixed(
        2
      )}MB) exceeds 10MB limit`;
    }

    return null;
  };

  // ✅ FIXED: Upload to Cloudinary with comprehensive debugging
  const uploadToCloudinary = async (
    file: File
  ): Promise<{ url: string; public_id: string }> => {
    console.log("🚀 CLIENT: Starting upload for:", file.name);

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("purpose", "moderator_application");

    try {
      console.log("📡 CLIENT: Making fetch request...");

      const response = await fetch("/business/services/api/upload-document", {
        method: "POST",
        body: formDataUpload,
      });

      console.log("📡 CLIENT: Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        let errorMessage = `Upload failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("❌ CLIENT: Error response body:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error(
            "❌ CLIENT: Could not parse error response:",
            parseError
          );
          const errorText = await response.text();
          console.error("❌ CLIENT: Raw error response:", errorText);
        }
        throw new Error(errorMessage);
      }

      // Parse response
      let result;
      try {
        const responseText = await response.text();
        console.log("📡 CLIENT: Raw response body:", responseText);

        result = JSON.parse(responseText);
        console.log("✅ CLIENT: Parsed response:", result);
      } catch (parseError) {
        console.error("❌ CLIENT: JSON parse error:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      // Validate response structure
      if (!result.secure_url && !result.data?.secure_url) {
        console.error("❌ CLIENT: No secure_url found in response:", result);
        throw new Error("Server did not return a file URL");
      }

      // Extract URL and public_id (handle different response formats)
      const secure_url = result.secure_url || result.data?.secure_url;
      const public_id = result.public_id || result.data?.public_id || "";

      console.log("🎉 CLIENT: Upload successful!", { secure_url, public_id });

      return {
        url: secure_url,
        public_id: public_id,
      };
    } catch (error) {
      console.error("❌ CLIENT: Upload function error:", error);
      throw error;
    }
  };

  // ✅ FIXED: Create preview for images
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve("");
      }
    });
  };

  // ✅ FIXED: Handle file selection with better error handling
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    console.log(
      "📂 CLIENT: Files selected:",
      selectedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );

    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    let hasErrors = false;

    for (const file of selectedFiles) {
      try {
        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          console.error(
            "❌ CLIENT: Validation failed for",
            file.name,
            ":",
            validationError
          );
          alert(`${file.name}: ${validationError}`);
          hasErrors = true;
          continue;
        }

        // Check for duplicates
        if (
          uploadedDocs.some(
            (doc) => doc.file.name === file.name && doc.file.size === file.size
          )
        ) {
          console.warn("⚠️ CLIENT: Duplicate file:", file.name);
          alert(`${file.name}: File already uploaded`);
          continue;
        }

        console.log("📄 CLIENT: Processing file:", file.name);

        // Add to state with uploading status
        const newDoc: UploadedDocument = {
          file,
          url: "",
          public_id: "",
          isUploading: true,
        };

        setUploadedDocs((prev) => {
          const updated = [...prev, newDoc];
          console.log(
            "📊 CLIENT: Added to uploadedDocs:",
            updated.map((d) => ({
              name: d.file.name,
              isUploading: d.isUploading,
              url: d.url,
            }))
          );
          return updated;
        });

        // Create preview for images
        try {
          const previewUrl = await createPreview(file);
          if (previewUrl) {
            setPreviews((prev) => ({ ...prev, [file.name]: previewUrl }));
          }
        } catch (previewError) {
          console.warn("⚠️ CLIENT: Preview creation failed:", previewError);
        }

        // Upload to Cloudinary
        console.log("🔄 CLIENT: Starting Cloudinary upload for:", file.name);

        try {
          const { url, public_id } = await uploadToCloudinary(file);

          console.log("✅ CLIENT: Upload successful, updating state:", {
            file: file.name,
            url,
            public_id,
          });

          // Update document state with success
          setUploadedDocs((prev) => {
            const updated = prev.map((doc) =>
              doc.file.name === file.name && doc.file.size === file.size
                ? { ...doc, url, public_id, isUploading: false }
                : doc
            );
            console.log(
              "📊 CLIENT: Updated uploadedDocs (success):",
              updated.map((d) => ({
                name: d.file.name,
                isUploading: d.isUploading,
                url: d.url,
                error: d.error,
              }))
            );
            return updated;
          });
        } catch (uploadError) {
          console.error(
            "❌ CLIENT: Upload failed for",
            file.name,
            ":",
            uploadError
          );
          hasErrors = true;

          // Update document state with error
          setUploadedDocs((prev) => {
            const updated = prev.map((doc) =>
              doc.file.name === file.name && doc.file.size === file.size
                ? {
                    ...doc,
                    isUploading: false,
                    error:
                      uploadError instanceof Error
                        ? uploadError.message
                        : "Upload failed",
                  }
                : doc
            );
            console.log(
              "📊 CLIENT: Updated uploadedDocs (error):",
              updated.map((d) => ({
                name: d.file.name,
                isUploading: d.isUploading,
                url: d.url,
                error: d.error,
              }))
            );
            return updated;
          });
        }
      } catch (error) {
        console.error(
          "❌ CLIENT: Unexpected error processing file:",
          file.name,
          error
        );
        hasErrors = true;
      }
    }

    setIsUploading(false);

    if (hasErrors) {
      console.warn("⚠️ CLIENT: Some files failed to upload");
    }

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove uploaded file
  const removeFile = (docToRemove: UploadedDocument) => {
    console.log("🗑️ CLIENT: Removing file:", docToRemove.file.name);

    setUploadedDocs((prev) => {
      const updated = prev.filter(
        (doc) =>
          !(
            doc.file.name === docToRemove.file.name &&
            doc.file.size === docToRemove.file.size
          )
      );
      console.log(
        "📊 CLIENT: Updated uploadedDocs (after removal):",
        updated.map((d) => ({ name: d.file.name, url: d.url }))
      );
      return updated;
    });

    // Remove preview
    setPreviews((prev) => {
      const updated = { ...prev };
      delete updated[docToRemove.file.name];
      return updated;
    });
  };

  // Retry upload
  const retryUpload = async (docToRetry: UploadedDocument) => {
    console.log("🔄 CLIENT: Retrying upload for:", docToRetry.file.name);

    // Mark as uploading
    setUploadedDocs((prev) =>
      prev.map((doc) =>
        doc.file.name === docToRetry.file.name &&
        doc.file.size === docToRetry.file.size
          ? { ...doc, isUploading: true, error: undefined }
          : doc
      )
    );

    try {
      const { url, public_id } = await uploadToCloudinary(docToRetry.file);

      // Update with success
      setUploadedDocs((prev) =>
        prev.map((doc) =>
          doc.file.name === docToRetry.file.name &&
          doc.file.size === docToRetry.file.size
            ? { ...doc, url, public_id, isUploading: false, error: undefined }
            : doc
        )
      );
    } catch (uploadError) {
      // Update with error
      setUploadedDocs((prev) =>
        prev.map((doc) =>
          doc.file.name === docToRetry.file.name &&
          doc.file.size === docToRetry.file.size
            ? {
                ...doc,
                isUploading: false,
                error:
                  uploadError instanceof Error
                    ? uploadError.message
                    : "Upload failed",
              }
            : doc
        )
      );
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Drag and drop handlers
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    const mockEvent = {
      target: { files },
    } as React.ChangeEvent<HTMLInputElement>;

    handleFileSelect(mockEvent);
  };

  // Count successfully uploaded documents
  const successfullyUploadedCount = uploadedDocs.filter(
    (doc) => doc.url && !doc.error && !doc.isUploading
  ).length;

  // Enhanced debug info
  console.log("📈 RENDER: Component state:", {
    uploadedDocsCount: uploadedDocs.length,
    successfulCount: successfullyUploadedCount,
    formDocumentsCount: formData.documents?.length || 0,
    formDocuments: formData.documents,
    uploadedDocs: uploadedDocs.map((d) => ({
      name: d.file.name,
      url: d.url,
      isUploading: d.isUploading,
      error: d.error,
    })),
  });

  return (
    <div>
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-indigo-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">
          Upload Required Documents
        </h2>
      </div>

      <div className="space-y-6">
        {/* Enhanced Debug Info */}
        <div className="p-4 bg-gray-100 rounded-lg text-sm font-mono">
          <div className="font-bold mb-2 text-gray-800">🔍 Debug Status:</div>
          <div className="space-y-1 text-gray-700">
            <div>
              📄 Uploaded Docs:{" "}
              <span className="font-semibold">{uploadedDocs.length}</span>
            </div>
            <div>
              ✅ Successful:{" "}
              <span className="font-semibold text-green-600">
                {successfullyUploadedCount}
              </span>
            </div>
            <div>
              📝 Form Documents:{" "}
              <span className="font-semibold">
                {formData.documents?.length || 0}
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xs text-gray-600">URLs in form:</div>
              <div className="bg-white p-2 rounded text-xs break-all">
                {JSON.stringify(formData.documents, null, 2)}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload your documents
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop files here, or click to browse
          </p>

          <input
            title="name"
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading to Cloud...
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                Choose Files
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-3">
            Supports: PDF, DOC, DOCX, TXT, JPG, PNG • Max size: 10MB per file
          </p>
        </div>

        {/* Error Display */}
        {errors.documents && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-600 mb-1">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              <span className="font-medium">{errors.documents}</span>
            </div>
            <p className="text-sm text-red-500">
              Currently uploaded:{" "}
              <span className="font-semibold">{successfullyUploadedCount}</span>{" "}
              document(s)
            </p>
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedDocs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Documents ({successfullyUploadedCount}/{uploadedDocs.length}{" "}
              uploaded successfully)
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {uploadedDocs.map((doc, index) => (
                <div
                  key={`${doc.file.name}-${index}`}
                  className={`border rounded-lg p-4 ${
                    doc.error
                      ? "border-red-200 bg-red-50"
                      : doc.url
                      ? "border-green-200 bg-green-50"
                      : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* File Icon */}
                      <div className="flex-shrink-0">
                        {doc.file.type.startsWith("image/") ? (
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              IMG
                            </span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-red-600">
                              {doc.file.type.includes("pdf") ? "PDF" : "DOC"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-gray-900 truncate"
                          title={doc.file.name}
                        >
                          {doc.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.file.size)} •{" "}
                          {doc.file.type.split("/")[1].toUpperCase()}
                        </p>

                        {/* Status */}
                        <div className="mt-1">
                          {doc.isUploading && (
                            <div className="flex items-center text-blue-600">
                              <svg
                                className="animate-spin h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              <span className="text-xs font-medium">
                                Uploading...
                              </span>
                            </div>
                          )}

                          {doc.url && !doc.error && (
                            <div className="flex items-center text-green-600">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              <span className="text-xs font-medium">
                                Uploaded successfully
                              </span>
                            </div>
                          )}

                          {doc.error && (
                            <div className="space-y-1">
                              <div className="flex items-center text-red-600">
                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                <span className="text-xs font-medium">
                                  Upload failed
                                </span>
                              </div>
                              <p className="text-xs text-red-500">
                                {doc.error}
                              </p>
                              <button
                                onClick={() => retryUpload(doc)}
                                className="text-xs text-red-600 underline hover:no-underline font-medium"
                              >
                                Retry upload
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFile(doc)}
                      className="ml-3 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Required Document Types:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Sports coaching certification (PDF or image)</li>
            <li>• First aid/CPR certification (PDF or image)</li>
            <li>• Athletic training credentials (PDF or image)</li>
            <li>• Background check clearance (PDF or image)</li>
            <li>• Professional references (PDF or image)</li>
          </ul>
          <p className="text-xs text-blue-600 mt-3">
            <strong>Note:</strong> All documents will be uploaded to secure
            cloud storage and reviewed by our verification team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentsStep;
