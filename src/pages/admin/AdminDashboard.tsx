import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoaderCircle, Trash2, PlusCircle, AlertTriangle, FileText, Pencil, Play, Users } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";
import { useNavigate } from "react-router-dom";

interface Questionnaire {
  id: number;
  name: string;
  description: string;
}

const AdminDashboard = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchQuestionnaires = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('admin/questionnaires');
      if (response.success) {
        setQuestionnaires(response.data);
      } else {
        throw new Error(response.message || "خطا در دریافت لیست پرسشنامه‌ها");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminAuthToken');
    toast.success("از حساب خود خارج شدید.");
    navigate('/admin/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('adminAuthToken');
    if (!token) {
      toast.error("برای دسترسی به این صفحه باید وارد شوید.");
      navigate('/admin/login');
      return;
    }
    fetchQuestionnaires();
  }, [navigate]);

  const handleDeleteAllAssessments = async () => {
    if (!window.confirm("آیا از حذف تمام نتایج ارزیابی‌ها مطمئن هستید؟ این عمل غیرقابل بازگشت است.")) {
      return;
    }
    setIsDeletingAll(true);
    try {
      const response = await apiFetch('admin/assessments', { method: 'DELETE' });
      if (response.success) {
        toast.success(response.message || "تمام نتایج با موفقیت حذف شدند.");
      } else {
        throw new Error(response.message || "خطا در حذف ارزیابی‌ها");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleDeleteQuestionnaire = async (id: number) => {
    if (!window.confirm(`آیا از حذف این پرسشنامه و تمام نتایج مرتبط با آن مطمئن هستید؟`)) {
      return;
    }
    setDeletingId(id);
    try {
      const response = await apiFetch(`admin/questionnaires/${id}`, { method: 'DELETE' });
      if (response.success) {
        toast.success(response.message);
        fetchQuestionnaires(); // Refresh the list
      } else {
        throw new Error(response.message || "خطا در حذف پرسشنامه");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = async (id: number) => {
      try {
        const response = await apiFetch(`admin/assessment/preview/${id}`, {
            method: 'POST'
        });
        if(response.success && response.data) {
            toast.info("در حال انتقال به صفحه پیش‌نمایش چت...");
            navigate(`/admin/assessment/preview/${response.data.questionnaireId}`, { 
                state: {
                    sessionId: response.data.sessionId,
                    initialMessage: response.data.initialMessage,
                    settings: response.data.settings
                } 
            });
        } else {
            throw new Error(response.message || "خطا در شروع پیش‌نمایش");
        }
      } catch(error: any) {
          toast.error(error.message);
      }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">داشبورد ادمین</h1>
            <p className="text-gray-500">به پنل مدیریت hrbooteh خوش آمدید.</p>
          </div>
          <Button onClick={handleLogout} variant="outline">خروج</Button>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Users />
                  مدیریت کاربران
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">مشاهده لیست کاربران</p>
                    <p className="text-sm text-gray-600">لیست تمام کاربران ثبت‌نام شده در سیستم.</p>
                  </div>
                  <Button onClick={() => navigate('/admin/users')}>مشاهده</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <FileText />
                  گزارش‌های کاربران
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">مشاهده نتایج ارزیابی‌ها</p>
                    <p className="text-sm text-gray-600">نتایج نهایی تمام ارزیابی‌های تکمیل شده.</p>
                  </div>
                  <Button onClick={() => navigate('/admin/reports')}>مشاهده</Button>
                </div>
              </CardContent>
            </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>مدیریت پرسشنامه‌ها</CardTitle>
                <CardDescription>پرسشنامه‌های ارزیابی موجود در سیستم را مدیریت کنید.</CardDescription>
              </div>
              <Button onClick={() => navigate('/admin/questionnaires/new')}>
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن پرسشنامه جدید
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {questionnaires.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-4 border rounded-md bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800">{q.name}</h3>
                      <p className="text-sm text-gray-500">{q.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePreview(q.id)} title="پیش‌نمایش">
                            <Play className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">پیش‌نمایش</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/questionnaires/edit/${q.id}`)} title="ویرایش">
                            <Pencil className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestionnaire(q.id)} disabled={deletingId === q.id} title="حذف">
                            {deletingId === q.id ? <LoaderCircle className="animate-spin h-4 w-4 text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle />
              منطقه خطر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">پاک کردن تمام نتایج ارزیابی‌ها</p>
                <p className="text-sm text-gray-600">این عمل تمام نتایج و تاریخچه چت کاربران را برای همیشه حذف می‌کند.</p>
              </div>
              <Button variant="destructive" onClick={handleDeleteAllAssessments} disabled={isDeletingAll}>
                {isDeletingAll ? <LoaderCircle className="animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                پاک کردن نتایج
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
