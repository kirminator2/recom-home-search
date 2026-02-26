import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  time: string;
}

interface ComplexChatProps {
  complexName: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Здравствуйте! Интересуетесь этим ЖК? Я могу помочь с подбором квартиры, рассказать о ценах и условиях покупки.",
    sender: "agent",
    time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
  },
];

export const ComplexChat = ({ complexName }: ComplexChatProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated agent reply
    setTimeout(() => {
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Спасибо за ваш вопрос! Специалист ответит в ближайшее время. Оставьте ваш номер телефона, и мы перезвоним.",
        sender: "agent",
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, agentMsg]);
    }, 1500);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-hover lg:static lg:w-full lg:rounded-lg lg:h-10 lg:shadow-none"
      >
        <MessageSquare className="h-5 w-5 lg:h-4 lg:w-4" />
        <span className="hidden lg:inline ml-2 text-sm">Открыть чат</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-primary px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/20">
            <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium text-primary-foreground">Консультант</p>
            <p className="text-[10px] text-primary-foreground/70">Онлайн</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-primary-foreground/70 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[320px] min-h-[200px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              msg.sender === "agent" ? "bg-primary/10" : "bg-secondary"
            }`}>
              {msg.sender === "agent" ? (
                <MessageSquare className="h-3 w-3 text-primary" />
              ) : (
                <User className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {msg.text}
              <span className={`block mt-1 text-[10px] ${
                msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
              }`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите сообщение..."
            className="h-8 text-xs"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={sendMessage}
            disabled={!input.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
