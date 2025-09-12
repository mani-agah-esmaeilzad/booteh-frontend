import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./avatar";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  senderName?: string;
  timestamp?: Date;
  className?: string;
}

export const ChatBubble = ({ 
  message, 
  isUser, 
  senderName,
  timestamp,
  className 
}: ChatBubbleProps) => {
  return (
    <div className={cn(
      "flex gap-3 mb-6 animate-slide-in",
      isUser ? "flex-row-reverse" : "flex-row",
      className
    )}>
      {/* Avatar */}
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarFallback className={cn(
          isUser ? "bg-hrbooteh-primary text-hrbooteh-primary-foreground" : "bg-hrbooteh-accent text-hrbooteh-accent-foreground"
        )}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Message Container */}
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Sender Name */}
        {senderName && (
          <div className={cn(
            "text-xs font-medium mb-1 px-1",
            isUser ? "text-hrbooteh-primary" : "text-hrbooteh-accent"
          )}>
            {senderName}
          </div>
        )}
        
        {/* Message Bubble */}
        <div className={cn(
          "px-4 py-3 rounded-xl max-w-full break-words shadow-hrbooteh-sm",
          isUser 
            ? "bg-hrbooteh-chat-user text-hrbooteh-chat-user-foreground rounded-br-md" 
            : "bg-hrbooteh-chat-ai text-hrbooteh-text-primary border border-hrbooteh-chat-ai-border rounded-bl-md"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
        
        {/* Timestamp */}
        {timestamp && (
          <div className="text-xs text-hrbooteh-text-muted mt-1 px-1">
            {timestamp.toLocaleTimeString('fa-IR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
};