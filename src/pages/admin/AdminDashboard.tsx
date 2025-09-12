import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoaderCircle, Trash2, PlusCircle, AlertTriangle, FileText } from "lucide-react";
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
      }
    } catch (error: any) {
      toast.error("خطا در دریافت لیست پرسشنامه‌ها: " + error.message);
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
        toast.success(response.message);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.error("خطا در حذف ارزیابی‌ها: " + error.message);
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
        fetchQuestionnaires();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast.error("خطا در حذف پرسشنامه: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">داشبورد ادمین</h1>
          <Button onClick={handleLogout} variant="outline">خروج</Button>
        </header>

        <Card className="mb-8">
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
                <p className="text-sm text-gray-600">نتایج نهایی تمام ارزیابی‌های تکمیل شده توسط کاربران را مشاهده کنید.</p>
              </div>
              <Button onClick={() => navigate('/admin/reports')}>
                مشاهده گزارش‌ها
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 border-destructive bg-destructive/5">
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

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>مدیریت پرسشنامه‌ها</CardTitle>
                <CardDescription>لیست پرسشنامه‌های ارزیابی موجود در سیستم.</CardDescription>
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
                  <div key={q.id} className="flex items-center justify-between p-4 border rounded-md bg-white">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800">{q.name}</h3>
                      <p className="text-sm text-gray-500">{q.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestionnaire(q.id)} disabled={deletingId === q.id}>
                      {deletingId === q.id ? <LoaderCircle className="animate-spin h-4 w-4 text-destructive" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;