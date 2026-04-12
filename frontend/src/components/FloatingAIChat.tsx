"use client";

import { useState } from "react";
import { Bot, X, Send, User, MessageCircle } from "lucide-react";

type ChatVariant = "client" | "agent" | "talent";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FloatingAIChatProps {
  variant?: ChatVariant;
}

const VARIANT_CONFIG = {
  client: {
    title: "AI Campaign Assistant",
    description: "Find talent, create offers, and generate contracts using AI.",
    welcome: "Hi! I can help you find the right talent or create a campaign. What are you looking for?",
    placeholder: "Describe your campaign or request…",
    quickActions: [
      { label: "Find Talent", prompt: "Find talent for beauty campaign" },
      { label: "Generate Offer", prompt: "Generate offer" },
      { label: "Create Contract", prompt: "Create contract" },
    ],
  },
  agent: {
    title: "AI Agent Assistant",
    description: "Manage talent, review deals, and analyze IP rights.",
    welcome:
      "Hello! I'm your AI Agent Assistant. I can help you generate contracts, review licensing deals, analyze talent performance, and manage IP rights. How can I assist you today?",
    placeholder: "Ask about contracts, deals, or IP rights…",
    quickActions: [
      { label: "Review Deals", prompt: "Review pending deals" },
      { label: "Generate Contract", prompt: "Generate contract" },
      { label: "Analyze Talent", prompt: "Analyze talent performance" },
    ],
  },
  talent: {
    title: "AI Talent Assistant",
    description: "Manage your profile, review requests, and track earnings.",
    welcome:
      "Hi! I'm your AI Talent Assistant. I can help you review incoming requests, understand contract terms, and optimize your profile. What do you need?",
    placeholder: "Ask about requests, earnings, or profile…",
    quickActions: [
      { label: "Review Requests", prompt: "Show pending requests" },
      { label: "My Earnings", prompt: "Show my earnings summary" },
      { label: "Profile Tips", prompt: "How can I improve my profile?" },
    ],
  },
};

function generateResponse(input: string, variant: ChatVariant): string {
  const lower = input.toLowerCase();

  if (variant === "client") {
    if (lower.includes("talent") || lower.includes("find") || lower.includes("beauty") || lower.includes("fashion")) {
      return "I found several talents matching your criteria:\n\n✓ Olga Bonny — Beauty & Fashion specialist\n✓ Emma Clarke — Luxury & Fashion expert\n✓ Marcus Chen — Sports & Fitness\n\nAll talents are verified and available for licensing. Would you like me to generate an offer for any of them?";
    }
    if (lower.includes("offer") || lower.includes("generate")) {
      return "I'll help you generate an offer. Let me know:\n\n• Campaign name and description\n• License duration (3/6/12 months)\n• Geographic territory\n• Media channels (social, print, TV, digital)\n• Budget range\n\nShould I create a draft offer template?";
    }
    if (lower.includes("contract")) {
      return "Creating a licensing contract requires:\n\n• Selected talent\n• Campaign terms and usage rights\n• Duration and territory\n• Compensation details\n• AI usage permissions\n\nOnce you approve, I'll generate the contract for review.";
    }
    return "I can assist you with:\n\n✓ Finding and filtering talent\n✓ Generating campaign offers\n✓ Creating licensing contracts\n✓ Managing campaign budgets\n✓ Tracking contract status\n\nWhat would you like to do?";
  }

  if (variant === "agent") {
    if (lower.includes("contract")) {
      return "I can help you generate a contract. I'll need:\n\n• Which talent is this for?\n• Which brand/campaign?\n• License duration and territory?\n• Usage rights (social, print, TV, AI)?\n\nWould you like me to create a draft contract template?";
    }
    if (lower.includes("deal") || lower.includes("review")) {
      return "Reviewing pending deals for your roster:\n\n⚠️ 3 new requests this week\n✓ 2 contracts awaiting signature\n🔄 1 renewal coming up\n\nWhich would you like to focus on?";
    }
    if (lower.includes("analyze") || lower.includes("performance")) {
      return "Talent performance summary:\n\n📈 Top earner this month: Olga Bonny\n📊 Most requested category: Fashion\n🏆 Fastest growing: Marcus Chen\n\nWant detailed analytics?";
    }
    return "I can help you with:\n\n✓ Contract generation and review\n✓ Deal negotiation\n✓ Talent performance analytics\n✓ IP rights management\n✓ Campaign approvals\n\nWhat would you like to do?";
  }

  // talent variant
  if (lower.includes("request")) {
    return "You have pending license requests:\n\n⏳ Under Review: 2\n📝 Awaiting Approval: 1\n✓ Approved: 4\n\nWould you like me to review them with you?";
  }
  if (lower.includes("earning") || lower.includes("payment") || lower.includes("money")) {
    return "Your earnings summary:\n\n💰 Total this month: £4,200\n📊 YTD revenue: £12,480\n💳 Next payout: In 3 days\n\n90% goes to you, 10% platform fee.";
  }
  if (lower.includes("profile") || lower.includes("tip")) {
    return "Tips to improve your profile:\n\n✨ Upload high-quality face photos (12 angles)\n📸 Add a variety of body shots\n🎥 Record an identity video\n🏷️ Tag your strongest categories\n\nShould I walk you through the next step?";
  }
  return "I can help you with:\n\n✓ Reviewing incoming license requests\n✓ Understanding contract terms\n✓ Managing your preferences\n✓ Tracking earnings\n✓ Optimizing your profile\n\nWhat would you like to do?";
}

export function FloatingAIChat({ variant = "client" }: FloatingAIChatProps) {
  const cfg = VARIANT_CONFIG[variant];
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: cfg.welcome },
  ]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: generateResponse(currentInput, variant) }]);
    }, 700);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center justify-center z-50 group"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[90vw] sm:w-[380px] h-[600px] max-h-[calc(100vh-3rem)] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-black text-white px-5 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{cfg.title}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-gray-300">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300 transition-colors" aria-label="Close chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-600">{cfg.description}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-lg text-sm whitespace-pre-line ${
                    msg.role === "user" ? "bg-black text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
            <div className="flex gap-2 flex-wrap">
              {cfg.quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInput(action.prompt)}
                  className="flex-1 text-xs bg-white border border-gray-200 text-black px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={cfg.placeholder}
                className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black"
                rows={2}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="absolute right-2 bottom-2 bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Press Enter to send</p>
          </div>
        </div>
      )}
    </>
  );
}
