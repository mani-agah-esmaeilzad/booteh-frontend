// فایل کامل و اصلاح شده: src/pages/admin/AdminUsers.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoaderCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch"; //  ایمپورت جدید
import { Badge } from "@/components/ui/badge"; //  ایمپورت جدید

interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    created_at: string;
    is_active: boolean; //  فیلد جدید
}

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('adminAuthToken');
        if (!token) {
            toast.error("برای دسترسی به این صفحه باید وارد شوید.");
            navigate('/admin/login');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('admin/users');
            if (response.success) {
                // تبدیل 0 و 1 به boolean
                const formattedUsers = response.data.map((user: any) => ({
                    ...user,
                    is_active: !!user.is_active
                }));
                setUsers(formattedUsers);
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            toast.error("خطا در دریافت لیست کاربران: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // تابع جدید برای تغییر وضعیت کاربر
    const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        
        // Optimistic UI Update: به‌روزرسانی ظاهری قبل از پاسخ سرور
        setUsers(prevUsers => 
            prevUsers.map(user => 
                user.id === userId ? { ...user, is_active: newStatus } : user
            )
        );

        try {
            const response = await apiFetch(`admin/users/${userId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ is_active: newStatus }),
            });
            if (response.success) {
                toast.success(response.message);
            } else {
                throw new Error(response.message);
            }
        } catch (error: any) {
            toast.error(`خطا در تغییر وضعیت: ${error.message}`);
            // Rollback UI on error: بازگرداندن به حالت قبل در صورت خطا
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, is_active: currentStatus } : user
                )
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex items-center gap-4 mb-8">
                    <Button onClick={() => navigate('/admin/dashboard')} variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">لیست کاربران سیستم</h1>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>کاربران ثبت‌نام شده</CardTitle>
                        <CardDescription>لیست تمام کاربرانی که در پلتفرم hrbooteh حساب کاربری ایجاد کرده‌اند.</CardDescription>
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
                                            <TableHead className="text-right">نام کامل</TableHead>
                                            <TableHead className="text-right">ایمیل</TableHead>
                                            <TableHead className="text-center">تاریخ ثبت‌نام</TableHead>
                                            <TableHead className="text-center">وضعیت</TableHead>
                                            <TableHead className="text-center">فعال/غیرفعال</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length > 0 ? users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.username}</div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                <TableCell className="text-center">{new Date(user.created_at).toLocaleDateString('fa-IR')}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={user.is_active ? "default" : "destructive"}>
                                                        {user.is_active ? "فعال" : "غیرفعال"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Switch
                                                        checked={user.is_active}
                                                        onCheckedChange={() => handleToggleUserStatus(user.id, user.is_active)}
                                                        aria-label={`تغییر وضعیت کاربر ${user.username}`}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">
                                                    هیچ کاربری یافت نشد.
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

export default AdminUsers;
