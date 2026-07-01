"use client";

import * as React from "react";

import { ProjectDocumentsView } from "@/components/project/documents";

import { api } from "@/lib/api";

import type { ProjectDocument } from "@/components/project/documents";

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

export default function SharedProjectDocumentsPage({ params }: PageProps) {
  const { shareToken } = React.use(params);

  const [documents, setDocuments] = React.useState<ProjectDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchSharedDocs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch shared documents directly
      const docs = await api.get(`/shared/projects/${shareToken}/documents`);
      if (docs) {
        setDocuments(docs);
      }
    } catch (err: any) {
      console.error("Failed to load shared project documents:", err);
      setError(err.message || "Không thể tải danh sách tài liệu công khai.");
    } finally {
      setIsLoading(false);
    }
  }, [shareToken]);

  React.useEffect(() => {
    fetchSharedDocs();
  }, [fetchSharedDocs]);

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 dark:text-red-400 font-semibold bg-white dark:bg-[#1d2125] min-h-full">
        {error}
      </div>
    );
  }

  // Dummy upload and delete handlers since it is read-only
  const noopUpload = async () => {};
  const noopDelete = async () => {};

  return (
    <div className="p-6 bg-white dark:bg-[#1d2125] min-h-full">
      <ProjectDocumentsView
        documents={documents}
        isLoading={isLoading}
        isUploading={false}
        isLeaderOrOwner={false}
        currentUser={null}
        readOnly={true}
        onUpload={noopUpload}
        onDelete={noopDelete}
      />
    </div>
  );
}
