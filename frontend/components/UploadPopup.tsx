"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  File,
  Image as ImageIcon,
  Video,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFile, UploadResponse } from "@/lib/services/upload.service";
import Image from "next/image";

interface UploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (data: any) => void;
  token: string;
  // Optional metadata for auto-saving to backend
  applicationId?: string;
  documentType?: string;
  documentName?: string;
}

export default function UploadPopup({
  isOpen,
  onClose,
  onUploadComplete,
  token,
  applicationId,
  documentType,
  documentName
}: UploadPopupProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFile(null);
        setPreview(null);
        setStatus("idle");
        setProgress(0);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ["image/jpeg", "image/png", "application/pdf", "video/mp4", "video/quicktime", "video/x-msvideo"];

    if (!validTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload an image, video, or PDF.");
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File is too large. Max size is 50MB.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(0);

    try {
      // Dynamically fetch session in case prop is stale/missing
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const authToken = token || (session as any)?.backendToken || (session as any)?.user?.token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);

      if (!authToken) {
        setStatus("error");
        setError("Authentication token is missing. Please refresh the page or log in again.");
        return;
      }

      // 1. Upload to Cloudinary
      const response = await uploadFile(file, authToken, (p) => setProgress(p));

      let finalData = response.data;

      // 2. If applicationId is provided, save to backend Document model
      if (applicationId && documentType) {
        const { documentService } = await import("@/lib/services/api.service");
        const newDoc = await documentService.create({
          applicationId,
          name: documentName || file.name,
          type: documentType,
          url: response.data.url,
          fileName: file.name,
          size: file.size / (1024 * 1024), // in MB
          status: "PENDING",
        });
        finalData = newDoc;
      }

      setStatus("success");
      onUploadComplete?.(finalData);

      // Auto close after success
      setTimeout(onClose, 2000);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Something went wrong during upload");
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-10 h-10 text-primary/40" />;
    if (file.type.startsWith("image/")) return <ImageIcon className="w-10 h-10 text-primary" />;
    if (file.type.startsWith("video/")) return <Video className="w-10 h-10 text-primary" />;
    return <FileText className="w-10 h-10 text-primary" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status !== "uploading" ? onClose : undefined}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-background border-2 border-primary/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-primary/5">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight text-foreground">Upload Media</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select your documents</p>
                </div>
                {status !== "uploading" && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-2xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all active:scale-90"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                {status === "idle" || status === "error" ? (
                  <div className="space-y-6">
                    {/* Upload Area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className={cn(
                        "relative group cursor-pointer flex flex-col items-center justify-center gap-5 py-14 px-8 border-2 border-dashed rounded-[2rem] transition-all duration-500",
                        file
                          ? "border-primary bg-primary/5 shadow-inner"
                          : "border-primary/10 hover:border-primary/30 bg-secondary/5 hover:bg-primary/5"
                      )}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        accept="image/*,video/*,application/pdf"
                      />

                      {preview ? (
                        <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-primary/20 animate-in zoom-in duration-500">
                          <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-5 rounded-[1.5rem] bg-primary/10 group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:shadow-primary/20">
                          {getFileIcon()}
                        </div>
                      )}

                      <div className="text-center">
                        <p className="text-sm font-black text-foreground">
                          {file ? file.name : "Click to select or drag and drop"}
                        </p>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-2">
                          PNG, JPG, MP4 or PDF (Max. 50MB)
                        </p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-600 text-xs font-bold"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <button
                      disabled={!file}
                      onClick={handleSubmit}
                      className={cn(
                        "w-full py-4 rounded-[1.25rem] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3",
                        file
                          ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
                          : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                      )}
                    >
                      <Upload className="w-5 h-5" />
                      Start Upload
                    </button>
                  </div>
                ) : status === "uploading" ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-10">
                    <div className="relative flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-8 border-primary/5" />
                      <svg className="absolute w-32 h-32 -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-primary transition-all duration-700 ease-out"
                          style={{
                            strokeDasharray: 351.86,
                            strokeDashoffset: 351.86 - (progress / 100) * 351.86
                          }}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-foreground">{progress}%</span>
                      </div>
                    </div>

                    <div className="w-full text-center space-y-2">
                      <p className="text-lg font-black tracking-tight text-foreground">Uploading files...</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Keep this window open</p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center justify-center gap-6"
                  >
                    <div className="w-24 h-24 rounded-[2rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                      <CheckCircle2 className="w-12 h-12 text-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-2xl font-black tracking-tight text-foreground">Upload Complete!</h4>
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Your files have been stored securely</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
