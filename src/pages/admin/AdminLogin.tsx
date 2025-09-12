// فایل کامل: src/pages/admin/AdminLogin.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";

const AdminLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await apiFetch('admin/login', {
                method: 'POST',
                body: JSON.stringify(formData),
            });

            if (response.success && response.data.token) {
                // توکن ادمین را با یک نام متفاوت ذخیره می‌کنیم تا با توکن کاربر تداخل نداشته باشد
                localStorage.setItem('adminAuthToken', response.data.token);
                toast.success("ورود ادمین با موفقیت انجام شد.");
                navigate('/admin/dashboard');
            } else {
                throw new Error(response.message || 'ورود ناموفق بود');
            }
        } catch (error: any) {
            toast.error(error.message || 'خطایی رخ داد.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-hrbooteh-background flex items-center justify-center p-4">
            <Card className="w-full max-w-sm shadow-lg">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Logo variant="large" />
                    </div>
                    <CardTitle className="text-2xl">ورود به پنل ادمین</CardTitle>
                    <CardDescription>برای مدیریت وارد شوید</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">نام کاربری</Label>
                            <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">رمز عبور</Label>
                            <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <LoaderCircle className="animate-spin" /> : 'ورود'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;