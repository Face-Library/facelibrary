"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  listConversations,
  getMessages,
  sendMessage,
  type ConversationSummary,
  type Message,
} from "@/lib/api";
import RoleAwareTopNav from "@/components/RoleAwareTopNav";

function formatTime(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function MessagesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  useEffect(() => {
    if (activeId != null) loadThread(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const loadConversations = async () => {
    setLoadingList(true);
    setError(null);
    try {
      const data = await listConversations();
      setConversations(data);
      if (data.length > 0 && activeId == null) setActiveId(data[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load conversations");
    } finally {
      setLoadingList(false);
    }
  };

  const loadThread = async (id: number) => {
    setLoadingThread(true);
    try {
      const data = await getMessages(id);
      setMessages(data);
      // Refresh unread counts in sidebar
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages");
    } finally {
      setLoadingThread(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    setError(null);
    try {
      const msg = await sendMessage(activeId, body);
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      // Bump conversation's last_message in sidebar
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === activeId
              ? { ...c, last_message: body, last_message_at: msg.created_at }
              : c
          )
          .sort((a, b) => {
            const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
            const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
            return tb - ta;
          })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const active = conversations.find((c) => c.id === activeId) || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleAwareTopNav active="Messages" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-semibold mb-4">Messages</h1>
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 bg-white border border-gray-200 rounded-2xl overflow-hidden min-h-[600px]">
          <aside className="border-r border-gray-200 bg-gray-50/60">
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
              <span className="text-sm font-semibold">Conversations</span>
              <span className="text-xs text-gray-500">{conversations.length}</span>
            </div>
            {loadingList ? (
              <div className="p-6 flex items-center justify-center text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading…
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                No conversations yet. Open a talent or brand profile to start one.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-white transition-colors ${
                        activeId === c.id ? "bg-white" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {c.other_user.email || `User #${c.other_user.id}`}
                          </div>
                          {c.other_user.role && (
                            <div className="text-[11px] uppercase tracking-wide text-gray-400">
                              {c.other_user.role}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {c.last_message || "No messages yet"}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] text-gray-400">
                            {formatTime(c.last_message_at)}
                          </span>
                          {c.unread_count > 0 && (
                            <span className="bg-black text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                              {c.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="flex flex-col min-h-[600px]">
            {!active ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                Select a conversation to view messages.
              </div>
            ) : (
              <>
                <div className="px-5 py-3 border-b border-gray-200 bg-white">
                  <div className="text-sm font-semibold">
                    {active.other_user.email || `User #${active.other_user.id}`}
                  </div>
                  {active.subject && (
                    <div className="text-xs text-gray-500">{active.subject}</div>
                  )}
                </div>
                <div
                  ref={threadRef}
                  className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/40"
                >
                  {loadingThread ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading messages…
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      Say hello to start the conversation.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender_id === user.user_id;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                              mine
                                ? "bg-black text-white rounded-br-sm"
                                : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                            }`}
                          >
                            {m.body}
                            <div
                              className={`text-[10px] mt-1 ${
                                mine ? "text-gray-300" : "text-gray-400"
                              }`}
                            >
                              {formatTime(m.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {error && (
                  <div className="mx-5 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}
                <form
                  onSubmit={handleSend}
                  className="px-5 py-3 border-t border-gray-200 bg-white flex items-center gap-2"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    disabled={sending}
                    maxLength={4000}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    aria-label="Send"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
