// فایل کامل و اصلاح شده: src/pages/admin/NewQuestionnaire.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";
import { Switch } from "@/components/ui/switch";

// کتابخانه‌های لازم برای خواندن فایل
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// تنظیم مسیر worker برای pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type FormFields = 'initial_prompt' | 'persona_prompt' | 'analysis_prompt';

const NewQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    initial_prompt: "سلام {user_name}، با توجه به تجربه‌ات در حوزه {user_job}، ما با یک چالش جدید روبرو شده‌ایم...",
    persona_prompt: "شما یک مشاور منابع انسانی هستید. مکالمه را مدیریت کن. باید بین {min_questions} تا {max_questions} سوال مرتبط با موضوع بپرسی. اگر کاربر پاسخ نامرتبط داد، او را به آرامی به موضوع اصلی برگردان. وقتی اطلاعات کافی برای تحلیل داشti، در انتهای آخرین پاسخ خود عبارت [END_ASSESSMENT] را قرار بده.",
    analysis_prompt: "شما یک تحلیل‌گر ارشد منابع انسانی هستی. وظیفه شما تحلیل مکالمه با کاربر است. یک گزارش شامل نمره و تحلیل کیفی ارائه بده.",
    has_narrator: false,
    character_count: 1,
    has_timer: true,
    timer_duration: 15,
    min_questions: 5,
    max_questions: 8,
  });
  const navigate = useNavigate();

  // Ref برای input های فایل
  const fileInputRefs = {
    initial_prompt: useRef<HTMLInputElement>(null),
    persona_prompt: useRef<HTMLInputElement>(null),
    analysis_prompt: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      toast.error("برای دسترسی به این صفحه باید وارد شوید.");
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSwitchChange = (name: keyof typeof formData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // تابع مدیریت آپلود و استخراج متن (منطق ساده‌سازی شده)
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: FormFields) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("در حال پردازش فایل...", {
        description: `فایل: ${file.name}`,
    });

    try {
      let extractedText = "";
      const arrayBuffer = await file.arrayBuffer();

      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") { // .docx
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (file.type === "application/pdf") { // .pdf
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
          extractedText += pageText + '\n';
        }
      } else {
        throw new Error("فرمت فایل پشتیبانی نمی‌شود. لطفاً فایل .docx یا .pdf آپلود کنید.");
      }
      
      // متن استخراج شده مستقیماً در فرم قرار می‌گیرد
      setFormData(prev => ({ ...prev, [fieldName]: extractedText.trim() }));
      toast.success("متن با موفقیت از فایل استخراج شد و در کادر مربوطه قرار گرفت.", { id: toastId });

    } catch (error: any) {
      console.error("File processing error:", error);
      toast.error(error.message || "خطا در پردازش فایل.", { id: toastId });
    } finally {
        if (e.target) e.target.value = ''; // ریست کردن input فایل
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const processedFormData = {
        ...formData,
        persona_prompt: formData.persona_prompt
          .replace(/{min_questions}/g, formData.min_questions.toString())
          .replace(/{max_questions}/g, formData.max_questions.toString()),
      };

      const response = await apiFetch('admin/questionnaires', {
        method: 'POST',
        body: JSON.stringify(processedFormData),
      });

      if (response.success) {
        toast.success("پرسشنامه با موفقیت ایجاد شد!");
        navigate('/admin/dashboard');
      } else {
        throw new Error(response.errors?.[0]?.message || response.message || 'خطا در ایجاد پرسشنامه');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // تابع کمکی برای رندر کردن فیلدهای پرامپت
  const renderPromptField = (fieldName: FormFields, label: string, placeholder: string, helpText: string, rows: number) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={fieldName}>{label}</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRefs[fieldName].current?.click()}>
          <Upload className="w-4 h-4 ml-2" />
          ایمپورت از فایل
        </Button>
        <Input 
          type="file" 
          ref={fileInputRefs[fieldName]}
          className="hidden"
          accept=".docx,.pdf"
          onChange={(e) => handleFileImport(e, fieldName)}
        />
      </div>
      <Textarea 
        id={fieldName} 
        name={fieldName} 
        value={formData[fieldName]} 
        onChange={handleChange} 
        required 
        rows={rows} 
        placeholder={placeholder}
      />
      <p className="text-xs text-gray-500">{helpText}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>افزودن پرسشنامه جدید</CardTitle>
            <CardDescription>برای ساخت ارزیابی جدید، فرم زیر را تکمیل کنید.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام پرسشنامه</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات کوتاه</Label>
                  <Input id="description" name="description" value={formData.description} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-6 p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">تنظیمات سناریو</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_narrator">سناریو راوی داشته باشد؟</Label>
                  <Switch id="has_narrator" checked={formData.has_narrator} onCheckedChange={(checked) => handleSwitchChange('has_narrator', checked)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="character_count">تعداد کاراکترهای سناریو</Label>
                  <Input id="character_count" name="character_count" type="number" value={formData.character_count} onChange={handleChange} required min="1" />
                </div>
              </div>

              <div className="space-y-6 p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">تنظیمات زمان‌بندی</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_timer">تایمر فعال باشد؟</Label>
                  <Switch id="has_timer" checked={formData.has_timer} onCheckedChange={(checked) => handleSwitchChange('has_timer', checked)} />
                </div>
                {formData.has_timer && (
                  <div className="space-y-2">
                    <Label htmlFor="timer_duration">مدت زمان تایمر (به دقیقه)</Label>
                    <Input id="timer_duration" name="timer_duration" type="number" value={formData.timer_duration} onChange={handleChange} required min="1" />
                  </div>
                )}
              </div>

              <div className="space-y-6 p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">تنظیمات هوش مصنوعی</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_questions">حداقل تعداد سوالات مرتبط</Label>
                    <Input id="min_questions" name="min_questions" type="number" value={formData.min_questions} onChange={handleChange} required min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_questions">حداکثر تعداد سوالات مرتبط</Label>
                    <Input id="max_questions" name="max_questions" type="number" value={formData.max_questions} onChange={handleChange} required min="1" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                {renderPromptField('initial_prompt', 'پرامپت اولیه (پیام شروع)', 'اولین پیامی که شخصیت هوش مصنوعی به کاربر ارسال می‌کند...', 'می‌توانید از متغیرهای {user_name} و {user_job} استفاده کنید.', 5)}
                {renderPromptField('persona_prompt', 'پرامپت شخصیت AI (رفتار در طول چت)', 'دستورالعمل برای رفتار و شخصیت AI در طول مکالمه...','می‌توانید از متغیرهای {min_questions}, {max_questions}, {user_name} و {user_job} استفاده کنید.', 8)}
                {renderPromptField('analysis_prompt', 'پرامپت تحلیل (دستورالعمل نتیجه‌گیری)', 'دستورالعمل نهایی برای تحلیل کل مکالمه و نمره‌دهی...', '', 8)}
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>انصراف</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'ایجاد پرسشنامه'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewQuestionnaire;
