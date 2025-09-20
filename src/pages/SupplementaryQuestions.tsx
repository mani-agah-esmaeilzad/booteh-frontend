// src/pages/SupplementaryQuestions.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";
import { useAssessment } from "@/contexts/assessment-context";
import ResultsModal from "@/components/modals/ResultsModal"; // ایمپورت مودال نتایج

interface SupplementaryQuestionsData {
    supplementary_question_1: string;
    supplementary_question_2: string;
}

const SupplementaryQuestions = () => {
    const { assessmentId } = useParams<{ assessmentId: string }>();
    const navigate = useNavigate();
    const { updateAssessmentStatus } = useAssessment();

    const [questions, setQuestions] = useState<SupplementaryQuestionsData | null>(null);
    const [answers, setAnswers] = useState({ q1: "", q2: "" });
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5 * 60);
    const [isModalOpen, setIsModalOpen] = useState(false); // استیت برای کنترل مودال

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await apiFetch(`assessment/supplementary/${assessmentId}`);
                if (response.success) {
                    setQuestions(response.data);
                } else {
                    throw new Error("سوالات تکمیلی یافت نشدند.");
                }
            } catch (error: any) {
                toast.error(error.message);
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [assessmentId, navigate]);

    // تایمر
    useEffect(() => {
        if (isLoading) return; // تایمر تا وقتی که سوالات لود نشده‌اند، شروع نشود
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // ارسال خودکار پس از اتمام زمان
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isLoading]);

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await apiFetch(`assessment/finish/${assessmentId}`, {
                method: 'POST',
                body: JSON.stringify({ supplementary_answers: answers }),
            });

            // پیدا کردن ارزیابی فعلی برای آپدیت کردن وضعیت آن
            const assessmentsResponse = await apiFetch('assessment/status');
            const currentAssessment = assessmentsResponse.data.find((a: any) => a.id.toString() === assessmentId);

            if (currentAssessment) {
                updateAssessmentStatus(currentAssessment.stringId, 'completed');
            }

            toast.success("پاسخ‌ها با موفقیت ارسال شد!");
            setIsModalOpen(true); // باز کردن مودال نتایج

        } catch (error: any) {
            toast.error("خطا در ارسال پاسخ‌ها: " + error.message);
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        navigate('/dashboard'); // انتقال به داشبورد پس از بستن مودال
    };


    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><LoaderCircle className="animate-spin h-12 w-12" /></div>;
    }

    return (
        <div className="min-h-screen bg-hrbooteh-gradient-subtle flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>سوالات تکمیلی</CardTitle>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <p>لطفاً به دو سوال زیر پاسخ دهید تا تحلیل کامل‌تری داشته باشیم.</p>
                        <div className="flex items-center gap-2 font-mono">
                            <Clock className="h-4 w-4" />
                            {`${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {questions?.supplementary_question_1 && (
                        <div className="space-y-2">
                            <Label htmlFor="q1">{questions.supplementary_question_1}</Label>
                            <Textarea id="q1" value={answers.q1} onChange={e => setAnswers(prev => ({ ...prev, q1: e.target.value }))} rows={5} />
                        </div>
                    )}
                    {questions?.supplementary_question_2 && (
                        <div className="space-y-2">
                            <Label htmlFor="q2">{questions.supplementary_question_2}</Label>
                            <Textarea id="q2" value={answers.q2} onChange={e => setAnswers(prev => ({ ...prev, q2: e.target.value }))} rows={5} />
                        </div>
                    )}
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <LoaderCircle className="animate-spin" /> : "ارسال و مشاهده نتیجه"}
                    </Button>
                </CardContent>
            </Card>

            {/* رندر کردن مودال نتایج */}
            <ResultsModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                assessmentId={assessmentId ? parseInt(assessmentId, 10) : null}
            />
        </div>
    );
};
export default SupplementaryQuestions;