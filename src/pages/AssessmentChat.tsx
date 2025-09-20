// src/pages/AssessmentChat.tsx

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { Logo } from "@/components/ui/logo";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowUp, Mic, ArrowLeft, LoaderCircle, Clock } from "lucide-react";
import apiFetch from "@/services/apiService";
import { toast } from "sonner";

// اینترفیس برای API مرورگر
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onstart: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

// تعریف نوع window برای دسترسی به webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface AssessmentSettings {
  has_timer: boolean;
  timer_duration: number;
}
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  senderName: string;
}

const AssessmentChat = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [settings, setSettings] = useState<AssessmentSettings | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State و Ref برای قابلیت ویس
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // راه‌اندازی Web Speech API - بهینه‌سازی شده
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("مرورگر شما از قابلیت تشخیص گفتار پشتیبانی نمی‌کند.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.lang = 'fa-IR';
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast.error(`خطای تشخیص گفتار: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      // استفاده از آپدیت تابعی برای جلوگیری از وابستگی به inputValue
      if (finalTranscript) {
        setInputValue(prev => prev + finalTranscript);
      }
    };

    recognitionRef.current = recognition;

    // Cleanup on component unmount
    return () => {
      recognitionRef.current?.stop();
    };
  }, []); // <-- وابستگی خالی باعث می‌شود این useEffect فقط یک بار اجرا شود.

  // مدیریت دریافت اطلاعات اولیه از داشبورد
  useEffect(() => {
    const { state } = location;
    if (state?.initialMessage && state?.sessionId && state?.assessmentId && state?.settings) {
      setSessionId(state.sessionId);
      setAssessmentId(state.assessmentId);
      setSettings(state.settings);
      if (state.settings.has_timer) {
        setTimeLeft(state.settings.timer_duration * 60);
      }
      const welcomeMessage: Message = {
        id: "welcome",
        text: state.initialMessage,
        isUser: false,
        timestamp: new Date(),
        senderName: "مشاور"
      };
      setMessages([welcomeMessage]);
    } else {
      toast.error("خطا در شروع ارزیابی. لطفاً دوباره تلاش کنید.");
      navigate('/dashboard');
    }
  }, [location, navigate]);

  // مدیریت تایمر
  useEffect(() => {
    if (!settings?.has_timer) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAssessmentComplete('زمان شما برای چت به پایان رسید.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings]);

  // اسکرول خودکار به پایین
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !sessionId || !assessmentId) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }

    const userMessage: Message = { id: Date.now().toString(), text: inputValue, isUser: true, timestamp: new Date(), senderName: "شما" };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiFetch(`assessment/chat/${assessmentId}`, {
        method: 'POST',
        body: JSON.stringify({ message: currentInput, session_id: sessionId }),
      });

      if (response.success && response.data) {
        const aiMessage: Message = { id: (Date.now() + 1).toString(), text: response.data.aiResponse, isUser: false, timestamp: new Date(), senderName: "مشاور" };
        setMessages(prev => [...prev, aiMessage]);
        if (response.data.isComplete) {
          handleAssessmentComplete("مکالمه به پایان رسید. لطفاً به سوالات تکمیلی پاسخ دهید...");
        }
      } else {
        throw new Error(response.message || 'خطا در ارتباط با سرور');
      }
    } catch (err: any) {
      toast.error(err.message);
      setInputValue(currentInput); // بازگرداندن پیام کاربر در صورت خطا
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id)); // حذف پیام از لیست
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessmentComplete = (reason: string) => {
    if (!assessmentId) return;
    toast.info(reason);
    navigate(`/supplementary/${assessmentId}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast.warning("قابلیت تشخیص گفتار در دسترس نیست.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="min-h-screen bg-hrbooteh-background flex flex-col">
      <header className="bg-hrbooteh-surface shadow-hrbooteh-sm border-b border-hrbooteh-surface-elevated p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="hrbooteh-ghost" size="icon-sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-hrbooteh-text-primary">ارزیابی آنلاین</h1>
              <p className="text-sm text-hrbooteh-text-secondary">در حال گفتگو با مشاور</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {settings?.has_timer && (
              <div className="flex items-center gap-2 text-hrbooteh-text-primary">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-sm font-medium">{formatTime(timeLeft)}</span>
              </div>
            )}
            <Logo variant="small" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 pb-24">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message.text} isUser={message.isUser} senderName={message.senderName} timestamp={message.timestamp} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="bg-hrbooteh-chat-ai border border-hrbooteh-chat-ai-border rounded-xl px-4 py-3 max-w-[80%]">
                <div className="flex gap-1 items-center">
                  <span className="text-sm text-hrbooteh-text-secondary mr-2">...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-hrbooteh-surface border-t border-hrbooteh-surface-elevated p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <Button
              variant="hrbooteh-ghost"
              size="icon"
              className="shrink-0"
              onClick={handleMicClick}
              disabled={isLoading}
            >
              <Mic className={`w-5 h-5 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-hrbooteh-text-secondary'}`} />
            </Button>
            <div className="flex-1">
              <Textarea
                placeholder={isListening ? "در حال شنیدن..." : "پیام خود را اینجا بنویسید..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[48px] max-h-32 resize-none bg-hrbooteh-surface border-hrbooteh-surface-elevated focus:border-hrbooteh-primary"
                disabled={isLoading}
              />
            </div>
            <Button variant="hrbooteh" size="icon" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className="shrink-0">
              {isLoading ? <LoaderCircle className="animate-spin" /> : <ArrowUp className="w-5 h-5" />}
            </Button>
          </div>
          <div className="flex justify-between items-center mt-3 text-sm text-hrbooteh-text-secondary">
            <span>Enter برای ارسال، Shift+Enter برای خط جدید</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AssessmentChat;