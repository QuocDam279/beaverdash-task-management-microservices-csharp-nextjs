"use client";

import * as React from "react";

import { ProjectDocumentsView } from "@/components/project/documents";

import { useAuth } from "@/components/providers/AuthProvider";

import { api } from "@/lib/api";

import type { ProjectDocument } from "@/components/project/documents";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDocumentsPage({ params }: PageProps) {
  const { projectId } = React.use(params);
  const { user: currentUser } = useAuth();

  const [documents, setDocuments] = React.useState<ProjectDocument[]>([]);
  const [project, setProject] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch both project overview (for role permissions) and documents list
      const [overviewData, docsData] = await Promise.all([
        api.get(`/projects/${projectId}/overview`),
        api.get(`/projects/${projectId}/documents`),
      ]);

      if (overviewData) setProject(overviewData);
      if (docsData) setDocuments(docsData);
    } catch (err) {
      console.error("Failed to load project documents or overview details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post(`/projects/${projectId}/documents`, formData);
      
      // Refresh documents list
      const docsData = await api.get(`/projects/${projectId}/documents`);
      if (docsData) setDocuments(docsData);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    await api.delete(`/projects/${projectId}/documents/${documentId}`);
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  // Compute if current user is owner or team leader to allow project manager-level deletion
  const userWorkload = project?.memberWorkloads?.find((w: any) => w.userId === currentUser?.id);
  const isLeaderOrOwner = project
    ? project.teamId
      ? userWorkload?.role === "Trưởng nhóm"
      : project.createdByUserId === currentUser?.id || userWorkload?.role === "Chủ sở hữu"
    : false;

  return (
    <div className="p-6 bg-white dark:bg-[#1d2125] min-h-full">
      <ProjectDocumentsView
        documents={documents}
        isLoading={isLoading}
        isUploading={isUploading}
        isLeaderOrOwner={isLeaderOrOwner}
        currentUser={currentUser}
        readOnly={false}
        onUpload={handleUpload}
        onDelete={handleDelete}
      />
    </div>
  );
}
