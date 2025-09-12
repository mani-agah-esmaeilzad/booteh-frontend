import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoaderCircle, ArrowLeft, Eye } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from 'react-markdown';

interface Report {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    questionnaire_name: string;
    score: number;
    description: string;
    completed_at: string;
}

const AdminReports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
            toast.error("برای دسترسی به این صفحه باید وارد شوید.");
            navigate('/admin/login');
            return;
        }

        const fetchReports = async () => {
            setIsLoading(true);
            try {
                const response = await apiFetch('admin/reports');
                if (response.success) {
                    setReports(response.data);
                } else {
                    throw new Error(response.message);
                }
            } catch (error: any) {
                toast.error("خطا در دریافت گزارش‌ها: " + error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Button onClick={() => navigate('/admin/dashboard')} variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">گزارش ارزیابی‌های کاربران</h1>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>نتایج تکمیل شده</CardTitle>
                        <CardDescription>لیست تمام ارزیابی‌هایی که توسط کاربران تکمیل شده است.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-16">
                                <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">نام کاربر</TableHead>
                                            <TableHead className="text-right">نام ارزیابی</TableHead>
                                            <TableHead className="text-center">نمره</TableHead>
                                            <TableHead className="text-right">تاریخ تکمیل</TableHead>
                                            <TableHead className="text-center">عملیات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.length > 0 ? reports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <div className="font-medium">{report.first_name} {report.last_name}</div>
                                                    <div className="text-sm text-muted-foreground">{report.email}</div>
                                                </TableCell>
                                                <TableCell>{report.questionnaire_name}</TableCell>
                                                <TableCell className="text-center font-bold text-lg">{report.score}</TableCell>
                                                <TableCell>{new Date(report.completed_at).toLocaleDateString('fa-IR')}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/reports/${report.id}`)}>
                                                        <Eye className="h-4 w-4 ml-2" />
                                                        مشاهده جزئیات
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">
                                                    هیچ گزارش تکمیل شده‌ای یافت نشد.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminReports;