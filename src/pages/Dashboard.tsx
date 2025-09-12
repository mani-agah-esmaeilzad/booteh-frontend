// فایل کامل: mani-agah-esmaeilzad/hrbooteh-pathfinder/src/pages/Dashboard.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { ProgressTimeline, TimelineStep } from "@/components/ui/progress-timeline";
import { useAssessment } from "@/contexts/assessment-context";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, LoaderCircle, AlertTriangle, Award } from "lucide-react";
import apiFetch from "@/services/apiService";
import { toast } from "sonner";

const Dashboard = () => {
  const { assessments, currentAssessment, isLoading, error, fetchAssessments } = useAssessment();
  const [isStarting, setIsStarting] = useState(false);
  const navigate = useNavigate();

  const timelineSteps: TimelineStep[] = assessments.map(assessment => ({
    id: assessment.stringId,
    title: assessment.title,
    description: assessment.description,
    status: assessment.status
  }));

  const handleStartAssessment = async () => {
    if (!currentAssessment) return;
    setIsStarting(true);
    try {
      const apiEndpoint = `assessment/start/${currentAssessment.id}`;

      const response = await apiFetch(apiEndpoint, {
        method: 'POST',
      });

      if (response.success && response.data) {
        toast.success("ارزیابی با موفقیت شروع شد!");
        // ✅ اطمینان از صحت مسیر و داده‌های ارسالی
        navigate(currentAssessment.path, { 
          state: {
            sessionId: response.data.sessionId,
            initialMessage: response.data.message,
            assessmentId: response.data.assessmentId,
            settings: response.data.settings
          } 
        });
      } else {
        throw new Error(response.message || "خطا در شروع ارزیابی");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const completedCount = assessments.filter(a => a.status === 'completed').length;
  const totalCount = assessments.length;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-10">
          <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-hrbooteh-primary" />
          <p className="mt-4 text-hrbooteh-text-secondary">در حال بارگذاری اطلاعات...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-10 bg-destructive/10 rounded-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <p className="mt-4 text-destructive font-semibold">خطا در دریافت اطلاعات</p>
          <p className="text-hrbooteh-text-secondary mt-2">{error}</p>
          <Button onClick={() => fetchAssessments()} variant="destructive" className="mt-4">
            تلاش مجدد
          </Button>
        </div>
      );
    }

    return (
      <>
        <Card className="p-8 shadow-hrbooteh-lg border-0 bg-hrbooteh-surface mb-8">
          <h2 className="text-xl font-semibold text-hrbooteh-text-primary mb-6 text-center">
            وضعیت پیشرفت شما
          </h2>
          <ProgressTimeline steps={timelineSteps} />
        </Card>

        {currentAssessment && (
          <div className="text-center">
            <Button
              variant="hrbooteh-gradient"
              size="xl"
              onClick={handleStartAssessment}
              disabled={isStarting}
              className="min-w-[300px] group"
            >
              {isStarting ? <LoaderCircle className="animate-spin" /> : <ArrowLeft className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
              {isStarting ? "در حال شروع..." : "شروع ارزیابی بعدی"}
            </Button>
            <p className="text-hrbooteh-text-secondary mt-4">
              آماده برای شروع: {currentAssessment.title}
            </p>
          </div>
        )}

        {!currentAssessment && completedCount === totalCount && totalCount > 0 && (
          <div className="text-center">
            <div className="mb-6">
                <div className="w-16 h-16 bg-hrbooteh-gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-hrbooteh-success mb-2">
                  تبریک! مسیر ارزیابی تکمیل شد
                </h2>
                <p className="text-hrbooteh-text-secondary">
                  تمام ارزیابی‌ها با موفقیت انجام شده‌اند
                </p>
              </div>
              <Button
                variant="hrbooteh"
                size="lg"
                onClick={() => navigate('/results')}
              >
                مشاهده گزارش نهایی
              </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-hrbooteh-gradient-subtle">
      <header className="bg-hrbooteh-surface shadow-hrbooteh-sm border-b border-hrbooteh-surface-elevated">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo variant="large" />
            <Button variant="hrbooteh-ghost" size="icon-sm">
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-hrbooteh-text-primary mb-4">
              مسیر ارزیابی شما در hrbooteh
            </h1>
            <p className="text-hrbooteh-text-secondary text-lg">
              شما در حال طی کردن یک مسیر جامع ارزیابی مهارت‌های حرفه‌ای هستید
            </p>
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;