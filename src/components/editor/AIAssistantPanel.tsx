import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, X, StopCircle, RotateCcw, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAIChat, ChatMessage } from "@/hooks/useAIChat";
import { toast } from "sonner";

/** Strip all Markdown syntax to produce clean plain text */
const stripMarkdown = (md: string): string => {
  return md
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
    .replace(/^>\s*/gm, "")
    .replace(/^[\s]*[-*]\s+/gm, "• ")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/^[-*_]{3,}$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
interface Props {
  sectionTitle: string;
  sectionHint?: string;
  currentContent: string;
  planName: string;
  secteur?: string;
  devise?: string;
  sectionType?: "narrative" | "financial" | "swot";
  onInsertText?: (text: string) => void;
}

const AIAssistantPanel = ({
  sectionTitle,
  sectionHint,
  currentContent,
  planName,
  secteur,
  devise,
  sectionType = "narrative",
  onInsertText,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, send, reset, stop } = useAIChat({
    sectionTitle,
    sectionHint,
    currentContent,
    planName,
    secteur,
    devise,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    send(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyBlock = (text: string, idx: number) => {
    navigator.clipboard.writeText(stripMarkdown(text));
    setCopiedIdx(idx);
    toast.success("Copié (texte brut) !");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const quickPrompts = sectionType === "financial"
    ? [
        "Aide-moi à remplir ce tableau",
        "Quels montants sont réalistes ?",
        "Explique chaque ligne du tableau",
        "Donne un exemple chiffré pour mon secteur",
      ]
    : sectionType === "swot"
    ? [
        "Analyse les forces de mon projet",
        "Identifie les faiblesses possibles",
        "Quelles opportunités exploiter ?",
        "Quelles menaces anticiper ?",
      ]
    : [
        "Rédige cette section pour moi",
        "Améliore le texte existant",
        "Donne-moi un plan détaillé",
        "Quels points clés inclure ?",
      ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-[hsl(var(--gold-light))] text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-bold"
      >
        <Sparkles className="w-4 h-4" />
        Assistant IA
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[420px] h-[70vh] sm:h-[600px] sm:bottom-4 sm:right-4 flex flex-col bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary/10 to-[hsl(var(--gold-light))]/10 border-b border-border shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-foreground flex-1">
          Assistant IA — {sectionTitle}
        </span>
        <button
          onClick={() => { reset(); }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Nouvelle conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center py-2">
              Je peux vous aider à rédiger cette section. Posez une question ou choisissez un prompt rapide :
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInput(""); send(p); }}
                  className="text-left px-3 py-2 text-xs rounded-lg bg-secondary border border-border text-secondary-foreground hover:border-primary hover:text-primary transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-secondary-foreground rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 [&_blockquote]:px-3 [&_blockquote]:py-2 [&_blockquote]:rounded-lg [&_blockquote]:text-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  {!isLoading && msg.content.length > 20 && (
                    <div className="flex gap-1 mt-2 pt-2 border-t border-border">
                      <button
                        onClick={() => copyBlock(msg.content, i)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedIdx === i ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        Copier
                      </button>
                      {onInsertText && (
                        <button
                          onClick={() => {
                            onInsertText(stripMarkdown(msg.content));
                            toast.success("Texte inséré dans la section !");
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                        >
                          Insérer dans la section
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-secondary rounded-xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-border bg-card shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question…"
            rows={1}
            className="flex-1 resize-none bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors max-h-20"
          />
          {isLoading ? (
            <button
              onClick={stop}
              className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors shrink-0"
              title="Arrêter"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-30 shrink-0"
              title="Envoyer"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
