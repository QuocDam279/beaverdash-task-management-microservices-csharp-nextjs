"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { ChatContainer } from "@/components/chat/ChatContainer";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectChatPage({ params }: PageProps) {
  const { projectId } = React.use(params);
  const [project, setProject] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await api.get(`/projects/${projectId}/overview`);
        setProject(data);
      } catch (err) {
        console.error("Failed to load project details for chat:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-[#1d2125]">
        <svg className="animate-spin h-6 w-6 text-[#1868db]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ChatContainer
        roomId={projectId}
        roomType="project"
        roomName={project?.name || "Dự án"}
      />
    </div>
  );
}
