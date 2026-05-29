"use client";

import * as React from "react";
import { api } from "@/lib/api";

interface UseInputProps {
  projectId: string;
  inputText: string;
  setInputText: (text: string) => void;
  isSending: boolean;
  countdown: number;
  onSubmit: (
    text: string,
    attachment?: { fileName: string; fileSize: string; content: string } | null
  ) => void;
}

export function useAIAssistantInput({
  projectId,
  inputText,
  setInputText,
  isSending,
  countdown,
  onSubmit,
}: UseInputProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const [fileAttachment, setFileAttachment] = React.useState<{
    fileName: string;
    fileSize: string;
    content: string;
    estimatedTokens?: number;
  } | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);

  // Auto-size textarea height based on content
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Refocus textarea when input transitions from disabled to enabled
  const isDisabled = isSending || isUploading || countdown > 0;
  const prevIsDisabled = React.useRef(isDisabled);

  React.useEffect(() => {
    if (prevIsDisabled.current && !isDisabled) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
    prevIsDisabled.current = isDisabled;
  }, [isDisabled]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB limit for client uploads

    if (file.size > MAX_SIZE) {
      setUploadError("Kích thước tệp tối đa là 2MB. Vui lòng chọn tệp nhỏ hơn.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/v1/chat/upload", formData);
      if (res) {
        setFileAttachment({
          fileName: res.fileName,
          fileSize: res.fileSize,
          content: res.content,
          estimatedTokens: res.estimatedTokens,
        });
      }
    } catch (err: any) {
      console.error("Failed to upload/extract document:", err);
      setUploadError(err.message || "Không thể đọc tệp này. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectProjectDoc = async (doc: any) => {
    setIsPickerOpen(false);
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await api.post("/v1/chat/extract-project-document", {
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
      });
      if (res) {
        setFileAttachment({
          fileName: res.fileName,
          fileSize: res.fileSize,
          content: res.content,
          estimatedTokens: res.estimatedTokens,
        });
      }
    } catch (err: any) {
      console.error("Failed to extract project document:", err);
      setUploadError(err.message || "Không thể trích xuất văn bản từ tài liệu dự án.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (isSending || isUploading || countdown > 0) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() || fileAttachment) {
        onSubmit(inputText, fileAttachment);
        setFileAttachment(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || fileAttachment) {
      onSubmit(inputText, fileAttachment);
      setFileAttachment(null);
    }
  };

  return {
    fileAttachment,
    setFileAttachment,
    isUploading,
    uploadError,
    setUploadError,
    isPickerOpen,
    setIsPickerOpen,
    fileInputRef,
    textareaRef,
    handleFileChange,
    handleSelectProjectDoc,
    triggerFileInput,
    handleKeyDown,
    handleSubmit,
  };
}
