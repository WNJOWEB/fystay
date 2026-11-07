"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { HOST_REPLY_TEMPLATES } from "@/lib/hostReplyTemplates";

/** A reply box for an existing conversation - refreshes the page's own server-fetched messages on success, rather than maintaining a separate client-side copy of the thread. Hosts also get one-tap reply templates that fill the box for them to review before sending. */
export function MessageComposer({
  conversationId,
  showTemplates = false,
}: {
  conversationId: string;
  showTemplates?: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);

    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    setSending(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      toast.error(data?.error ?? "Could not send that message.");
      return;
    }

    setBody("");
    router.refresh();
  }

  function insertTemplate(text: string) {
    setBody((current) => (current.trim() ? `${current.trimEnd()}\n${text}` : text));
  }

  return (
    <div className="flex flex-col gap-2">
      {showTemplates && (
        <div className="flex flex-wrap gap-2" aria-label="Reply templates">
          {HOST_REPLY_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => insertTemplate(template.body)}
              className="focus-ring rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-brand-700 hover:text-brand-700"
            >
              {template.label}
            </button>
          ))}
        </div>
      )}
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Write a message…"
        rows={2}
        maxLength={4000}
      />
      <Button
        onClick={handleSend}
        loading={sending}
        disabled={!body.trim()}
        className="self-end"
      >
        Send
      </Button>
    </div>
  );
}
