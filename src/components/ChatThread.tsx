"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage, getMessagesSince, markThreadRead } from "@/app/actions/messages";
import { IconArrowRight } from "@/components/icons";

type ChatMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderName: string;
  senderRole: "ADMIN" | "EMPLOYEE";
  senderId: string;
};

export function ChatThread({
  employeeId,
  currentUserId,
  initialMessages,
}: {
  employeeId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const latestTimestamp = useRef<string | null>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].createdAt : null,
  );

  useEffect(() => {
    markThreadRead(employeeId);
  }, [employeeId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const fresh = await getMessagesSince(employeeId, latestTimestamp.current);
      if (fresh.length > 0) {
        setMessages((prev) => [...prev, ...fresh]);
        latestTimestamp.current = fresh[fresh.length - 1].createdAt;
        markThreadRead(employeeId);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [employeeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const content = draft.trim();
    if (!content) return;
    setDraft("");
    startTransition(async () => {
      await sendMessage(employeeId, content);
      const fresh = await getMessagesSince(employeeId, latestTimestamp.current);
      if (fresh.length > 0) {
        setMessages((prev) => [...prev, ...fresh]);
        latestTimestamp.current = fresh[fresh.length - 1].createdAt;
      }
    });
  }

  return (
    <div className="flex h-[28rem] flex-col rounded-lg border border-slate-200 bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            No messages yet &mdash; say hello.
          </p>
        )}
        {messages.map((m) => {
          const isMe = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`animate-fade-in-up max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMe ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"
                }`}
              >
                {!isMe && <p className="mb-0.5 text-xs font-semibold text-slate-500">{m.senderName}</p>}
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className={`mt-1 text-[10px] ${isMe ? "text-slate-300" : "text-slate-400"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-slate-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !draft.trim()}
          className="flex items-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
        >
          Send <IconArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
