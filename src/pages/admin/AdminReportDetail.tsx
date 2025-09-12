import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, ArrowLeft, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import { ChatBubble } from "@/components/ui/chat-bubble";

// تعریف انواع داده‌ها برای خوانایی بهتر
interface ReportDetail {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    questionnaire_name: string;
    score: number;
    description: string;
    completed_at: string;
}
interface ChatMessage {
    message_type: 'user' | 'ai';
    content: string;
    character_name: string;
    created_at: string;
}
interface FullReport {
    report: ReportDetail;
    chatHistory: ChatMessage[];
}

const AdminReportDetail = () => {
    const [fullReport, setFullReport] = useState<FullReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
            toast.error("برای دسترسی به این صفحه باید وارد شوید.");
            navigate('/admin/login');
            return;
        }

        const fetchReportDetail = async () => {
            setIsLoading(true);
            try {
                const response = await apiFetch(`admin/reports/${id}`);
                if (response.success) {
                    setFullReport(response.data);
                } else {
                    throw new Error(response.message);
                }
            } catch (error: any) {
                toast.error("خطا در دریافت جزئیات گزارش: " + error.message);
                navigate('/admin/reports'); // در صورت خطا به لیست برگرد
            } finally {
                setIsLoading(false);
            }
        };
        fetchReportDetail();
    }, [id, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoaderCircle className="h-12 w-12 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!fullReport) {
        return <div>گزارش یافت نشد.</div>;
    }

    const { report, chatHistory } = fullReport;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Button onClick={() => navigate('/admin/reports')} variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">گزارش جامع ارزیابی</h1>
                        <p className="text-gray-500">ارزیابی {report.questionnaire_name} برای کاربر {report.first_name} {report.last_name}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* ستون سمت راست: اطلاعات کاربر و نمره */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User /> اطلاعات کاربر</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p><strong>نام:</strong> {report.first_name} {report.last_name}</p>
                                <p><strong>ایمیل:</strong> {report.email}</p>
                                <p><strong>تاریخ تکمیل:</strong> {new Date(report.completed_at).toLocaleDateString('fa-IR')}</p>
                            </CardContent>
                        </Card>
                        <Card className="text-center">
                            <CardHeader>
                                <CardTitle>نمره نهایی</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-6xl font-bold text-blue-600">{report.score}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ستون اصلی: تحلیل و تاریخچه چت */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>تحلیل کیفی هوش مصنوعی</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-sm max-w-none">
                                <ReactMarkdown>{report.description}</ReactMarkdown>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MessageSquare /> تاریخچه کامل مکالمه</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-md">
                                {chatHistory.map((msg, index) => (
                                    <ChatBubble
                                        key={index}
                                        message={msg.content}
                                        isUser={msg.message_type === 'user'}
                                        senderName={msg.character_name}
                                        timestamp={new Date(msg.created_at)}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReportDetail;