import React, { useState, useRef } from "react";
import { User, FileText } from "lucide-react";
import { StepProps } from "../page";
export const DocumentsStep: React.FC<StepProps> = ({
  formData,
  updateFormData,
  errors,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accepted file types
  const acceptedTypes = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "application/pdf": [".pdf"],
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  // Validate file type and size
  const validateFile = (file: File): string | null => {
    const fileType = file.type;
    const fileSize = file.size;

    // Check file type
    if (!Object.keys(acceptedTypes).includes(fileType)) {
      return `File type "${fileType}" is not supported. Please upload JPG, PNG, GIF, or PDF files.`;
    }

    // Check file size
    if (fileSize > maxFileSize) {
      return `File size (${(fileSize / 1024 / 1024).toFixed(
        2
      )}MB) exceeds the maximum limit of 10MB.`;
    }

    return null;
  };

  // Create preview for images
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        // For PDFs, return a placeholder
        resolve("/api/placeholder/pdf-icon"); // You'd replace this with actual PDF icon
      }
    });
  };

  // Handle file selection
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: { [key: string]: string } = { ...previews };
    let errorMessages: string[] = [];

    setIsUploading(true);

    for (const file of selectedFiles) {
      const error = validateFile(file);
      if (error) {
        errorMessages.push(`${file.name}: ${error}`);
        continue;
      }

      // Check for duplicates
      if (
        uploadedFiles.some((f) => f.name === file.name && f.size === file.size)
      ) {
        errorMessages.push(`${file.name}: File already uploaded`);
        continue;
      }

      validFiles.push(file);

      // Create preview
      try {
        const previewUrl = await createPreview(file);
        newPreviews[file.name] = previewUrl;
      } catch (error) {
        console.error("Error creating preview:", error);
      }
    }

    if (errorMessages.length > 0) {
      alert(`Upload errors:\n${errorMessages.join("\n")}`);
    }

    if (validFiles.length > 0) {
      const newUploadedFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newUploadedFiles);
      setPreviews(newPreviews);

      // Update form data with file names (you might want to handle this differently)
      updateFormData({
        documents: newUploadedFiles.map((f) => f),
      });
    }

    setIsUploading(false);

    // Clear input to allow re-uploading same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove uploaded file
  const removeFile = (fileToRemove: File) => {
    const newUploadedFiles = uploadedFiles.filter(
      (f) => !(f.name === fileToRemove.name && f.size === fileToRemove.size)
    );

    const newPreviews = { ...previews };
    delete newPreviews[fileToRemove.name];

    setUploadedFiles(newUploadedFiles);
    setPreviews(newPreviews);

    updateFormData({
      documents: newUploadedFiles.map((f) => f),
    });
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

    const files: any = File;
    const mockEvent = {
      target: { files },
    } as React.ChangeEvent<HTMLInputElement>;

    handleFileSelect(mockEvent);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-indigo-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">
          Upload Required Documents
        </h2>
      </div>

      <div className="space-y-6">
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
          <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload your documents
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop files here, or click to browse
          </p>

          <input
            title="input"
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
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
                Processing...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Choose Files
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Supports: JPG, PNG, GIF, PDF • Max size: 10MB per file
          </p>
        </div>

        {errors.documents && (
          <p className="text-sm text-red-600">{errors.documents}</p>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Uploaded Documents ({uploadedFiles.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* File Preview */}
                      <div className="mb-3">
                        {file.type.startsWith("image/") ? (
                          <div className="w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                            {previews[file.name] && (
                              <img
                                src={previews[file.name]}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-red-50 rounded-md flex items-center justify-center">
                            <div className="text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="text-xs text-red-600 mt-1">
                                PDF Document
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div>
                        <p
                          className="text-sm font-medium text-gray-900 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} •{" "}
                          {file.type.split("/")[1].toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="ml-3 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Remove file"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
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
            <strong>Note:</strong> All documents will be reviewed by our
            verification team. Please ensure documents are clear and legible.
          </p>
        </div>
      </div>
    </div>
  );
};
