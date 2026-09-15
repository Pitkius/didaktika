"use client";

import { useEffect, useRef, useState } from "react";
import {
  chatWithAIAction,
  startAITeacherConversationAction,
} from "@/features/students/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send } from "lucide-react";
import { lt } from "@/lib/i18n";

interface Message {
  role: string;
  content: string;
}

interface AITeacherChatProps {
  initialMessages: Message[];
  conversationId: string | null;
}

export function AITeacherChat({ initialMessages, conversationId: initialId }: AITeacherChatProps) {
  const [conversationId, setConversationId] = useState(initialId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ensureConversation() {
    if (conversationId) return conversationId;
    const result = await startAITeacherConversationAction();
    if (result.conversationId) {
      setConversationId(result.conversationId);
      return result.conversationId;
    }
    return null;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || pending) return;

    const text = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setPending(true);

    try {
      const convId = await ensureConversation();
      if (!convId) return;

      const result = await chatWithAIAction({ message: text, conversationId: convId });
      if (result.success && result.content) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.content! }]);
      } else if (result.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: result.error! }]);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-[600px] flex-col rounded-le border border-neutral-200 bg-white">
      <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
        <Bot className="h-5 w-5 text-brand-600" />
        <span className="font-medium">{lt.nav.student.aiTeacher}</span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-neutral-500">
            {lt.student.aiTeacherChatEmpty}
          </p>
        )}
        {messages.map((mse, i) => (
          <div
            key={i}
            className={`flex ${mse.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-le px-4 py-2 text-sm ${
                mse.role === "user"
                  ? "bg-brand-600 text-white"
                  : "bg-neutral-100 text-neutral-800"
              }`}
            >
              {mse.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-neutral-200 p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lt.student.aiTeacherChatPlaceholder}
          disabled={pending}
        />
        <Button type="submit" disabled={pending || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
