import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";
import { Switch } from "@/components/ui/switch";

// Define a type for our form data for better type safety
interface QuestionnaireFormData {
  name: string;
  description: string;
  initial_prompt: string;
  persona_prompt: string;
  analysis_prompt: string;
  has_timer: boolean; // This will now always be a boolean
  timer_duration: number;
  min_questions: number;
  max_questions: number;
}

const EditQuestionnaire = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuestionnaireFormData>({
    name: "",
    description: "",
    initial_prompt: "",
    persona_prompt: "",
    analysis_prompt: "",
    has_timer: false, // Initial state is a proper boolean
    timer_duration: 15,
    min_questions: 5,
    max_questions: 8,
  });
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      toast.error("برای دسترسی به این صفحه باید وارد شوید.");
      navigate('/admin/login');
      return;
    }

    const fetchQuestionnaire = async () => {
      try {
        const response = await apiFetch(`admin/questionnaires/${id}`);
        if (response.success) {
          const fetchedData = response.data;
          
          // *** شروع تغییر کلیدی ***
          // Convert incoming numeric values (0 or 1) to actual booleans
          // before setting the state.
          const transformedData: QuestionnaireFormData = {
            name: fetchedData.name || "",
            description: fetchedData.description || "",
            initial_prompt: fetchedData.initial_prompt || "",
            persona_prompt: fetchedData.persona_prompt || "",
            analysis_prompt: fetchedData.analysis_prompt || "",
            has_timer: !!fetchedData.has_timer, // The '!!' operator converts any truthy (like 1) or falsy (like 0) value to a boolean
            timer_duration: fetchedData.timer_duration || 15,
            min_questions: fetchedData.min_questions || 5,
            max_questions: fetchedData.max_questions || 8,
          };
          // *** پایان تغییر کلیدی ***

          setFormData(transformedData);

        } else {
          throw new Error(response.message || "پرسشنامه یافت نشد");
        }
      } catch (error: any) {
        toast.error(error.message);
        navigate('/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestionnaire();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({ ...prev, [name]: finalValue as any }));
  };

  const handleSwitchChange = (name: keyof QuestionnaireFormData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // The formData now correctly contains true/false for has_timer
      const payload = {
        ...formData,
        has_narrator: false, // Still sending this for the API with a proper boolean
        character_count: 1,
      };
      
       const response = await apiFetch(`admin/questionnaires/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload), // JSON.stringify will correctly handle booleans
      });

      if (response.success) {
        toast.success("پرسشنامه با موفقیت به‌روزرسانی شد!");
        navigate('/admin/dashboard');
      } else {
        const errorMessage = response.errors?.[0]?.message || response.message || 'خطا در به‌روزرسانی پرسشنامه';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>ویرایش پرسشنامه</CardTitle>
            <CardDescription>فرم زیر را برای ویرایش ارزیابی تکمیل کنید.</CardDescription>
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
                <h3 className="text-lg font-medium mb-4">تنظیمات زمان‌بندی</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="has_timer">تایمر فعال باشد؟</Label>
                  {/* This component now receives a proper boolean from the state */}
                  <Switch id="has_timer" checked={formData.has_timer} onCheckedChange={(checked) => handleSwitchChange('has_timer', checked)} />
                </div>
                {formData.has_timer && ( // This also works perfectly with a proper boolean
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
                <div className="space-y-2">
                  <Label htmlFor="initial_prompt">پرامپت اولیه (پیام شروع)</Label>
                  <Textarea id="initial_prompt" name="initial_prompt" value={formData.initial_prompt} onChange={handleChange} required rows={5} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="persona_prompt">پرامپت شخصیت AI (رفتار در طول چت)</Label>
                  <Textarea id="persona_prompt" name="persona_prompt" value={formData.persona_prompt} onChange={handleChange} required rows={8} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="analysis_prompt">پرامپت تحلیل (دستورالعمل نتیجه‌گیری)</Label>
                  <Textarea id="analysis_prompt" name="analysis_prompt" value={formData.analysis_prompt} onChange={handleChange} required rows={8} />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>
                  انصراف
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoaderCircle className="animate-spin" /> : 'ذخیره تغییرات'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditQuestionnaire;