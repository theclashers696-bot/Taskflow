"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TaskComment } from "@/types";

async function fetchComments(taskId: number): Promise<TaskComment[]> {
  const res = await fetch(`/api/tasks/${taskId}/comments`);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

interface TaskCommentsProps {
  taskId: number;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const [content, setContent] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => fetchComments(taskId),
  });

  const addComment = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
      qc.invalidateQueries({ queryKey: ["activity", taskId] });
    },
    onError: () => toast.error("Failed to add comment"),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: number) => {
      const res = await fetch(`/api/tasks/${taskId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    addComment.mutate(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      const trimmed = content.trim();
      if (trimmed) addComment.mutate(trimmed);
    }
  }

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">
          Comments ({isLoading ? "…" : comments.length})
        </h3>
      </div>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment… (Ctrl+Enter to submit)"
          rows={3}
          className="resize-none text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || addComment.isPending}
        >
          {addComment.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
          Comment
        </Button>
      </form>

      {/* Comment list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar className="w-8 h-8 shrink-0">
                {comment.user?.image && <AvatarImage src={comment.user.image} />}
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {comment.user?.name ? initials(comment.user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {comment.userId === session?.user?.id && (
                    <button
                      onClick={() => deleteComment.mutate(comment.id)}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity ml-auto",
                        "text-muted-foreground hover:text-destructive"
                      )}
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
