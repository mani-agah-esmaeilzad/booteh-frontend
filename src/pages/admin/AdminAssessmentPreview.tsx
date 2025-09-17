// فایل کامل و اصلاح شده: src/pages/admin/AdminAssessmentPreview.tsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatBubble } from "@/components/ui/chat-bubble";
import { Logo } from "@/components/ui/logo";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowUp, ArrowLeft, LoaderCircle } from "lucide-react";
import apiFetch from "@/services/apiService";
import { toast } from "sonner";

// اینترفیس برای پیام‌های چت (سازگار با فرمت OpenAI)
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const AdminAssessmentPreview = () => {
  const { id: questionnaireId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState<any[]>([]); // برای نمایش در UI
  const [history, setHistory] = useState<ChatMessage[]>([]); // برای ارسال به AI
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { state } = location;
    if (state?.initialMessage) {
      const welcomeMessage = {
        id: "welcome",
        text: state.initialMessage,
        isUser: false,
        timestamp: new Date(),
        senderName: "مشاور (پیش‌نمایش)"
      };
      setMessages([welcomeMessage]);
      // اضافه کردن پیام اولیه به تاریخچه برای ارسال به AI
      setHistory([{ role: 'assistant', content: state.initialMessage }]);
    } else {
      toast.error("خطا در شروع پیش‌نمایش. لطفاً دوباره تلاش کنید.");
      navigate('/admin/dashboard');
    }
  }, [location, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessageForUI = { id: Date.now().toString(), text: inputValue, isUser: true, timestamp: new Date(), senderName: "ادمین (شما)" };
    setMessages(prev => [...prev, userMessageForUI]);
    
    const currentInput = inputValue;
    const currentHistory = [...history, { role: 'user' as const, content: currentInput }];
    setHistory(currentHistory); // آپدیت تاریخچه قبل از ارسال

    setInputValue("");
    setIsLoading(true);

    try {
      const response = await apiFetch(`admin/assessment/preview-chat`, {
        method: 'POST',
        body: JSON.stringify({
          message: currentInput,
          history: history, // ارسال تاریخچه قبلی
          questionnaireId: parseInt(questionnaireId || '0')
        }),
      });

      if (response.success && response.data) {
        const aiResponse = response.data.aiResponse;
        const aiMessageForUI = { id: (Date.now() + 1).toString(), text: aiResponse, isUser: false, timestamp: new Date(), senderName: "مشاور (پیش‌نمایش)" };
        setMessages(prev => [...prev, aiMessageForUI]);
        
        // آپدیت تاریخچه با پاسخ AI
        setHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);

        if (response.data.isComplete) {
          toast.success("پایان ارزیابی شبیه‌سازی شد.");
        }
      } else {
        throw new Error(response.message || 'خطا در ارتباط با سرور');
      }
    } catch (err: any) {
      toast.error(err.message);
      setInputValue(currentInput);
      setMessages(prev => prev.slice(0, -1)); // حذف پیام کاربر از UI در صورت خطا
      setHistory(prev => prev.slice(0, -1)); // حذف پیام کاربر از تاریخچه در صورت خطا
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-hrbooteh-background flex flex-col">
      <header className="bg-hrbooteh-surface shadow-hrbooteh-sm border-b border-hrbooteh-surface-elevated p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="hrbooteh-ghost" size="icon-sm" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-hrbooteh-text-primary">پیش‌نمایش ارزیابی</h1>
              <p className="text-sm text-hrbooteh-text-secondary">شما در حال تست به عنوان ادمین هستید</p>
            </div>
          </div>
           <Logo variant="small" />
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
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-hrbooteh-text-muted rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-hrbooteh-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-hrbooteh-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
             <Textarea
                placeholder="پیام خود را اینجا بنویسید..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[48px] max-h-32 resize-none bg-hrbooteh-surface border-hrbooteh-surface-elevated focus:border-hrbooteh-primary"
                disabled={isLoading}
              />
            <Button variant="hrbooteh" size="icon" onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className="shrink-0">
              {isLoading ? <LoaderCircle className="animate-spin" /> : <ArrowUp className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminAssessmentPreview;
