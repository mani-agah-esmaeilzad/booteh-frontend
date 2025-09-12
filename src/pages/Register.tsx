// فایل کامل: mani-agah-esmaeilzad/hrbooteh-pathfinder/src/pages/Register.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import apiFetch from "@/services/apiService";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
    password_confirmation: "", // ✅ تغییر یافت: از confirmPassword به password_confirmation
    phone_number: "",
    age: "",
    education_level: "",
    work_experience: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.password_confirmation) { // ✅ تغییر یافت
      toast.error("رمز عبور و تکرار آن یکسان نیستند");
      setIsLoading(false);
      return;
    }

    try {
      const submissionData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        password_confirmation: formData.password_confirmation, // ✅ تغییر یافت
        phone_number: formData.phone_number || null,
        age: formData.age || null,
        education_level: formData.education_level || null,
        work_experience: formData.work_experience || null,
      };

      const response = await apiFetch('auth/register', {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });

      if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        toast.success("ثبت‌نام با موفقیت انجام شد! در حال انتقال به داشبورد...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error(response.error || response.message || 'خطایی در ثبت‌نام رخ داد');
      }
    } catch (error: any) {
      toast.error(error.message || 'خطای سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hrbooteh-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-hrbooteh-lg border-0 bg-hrbooteh-surface overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Logo variant="large" />
          </div>
          <CardTitle className="text-2xl font-bold text-hrbooteh-text-primary">
            ثبت‌نام در hrbooteh
          </CardTitle>
          <CardDescription className="text-hrbooteh-text-secondary">
            حساب کاربری خود را ایجاد کنید و مسیر ارزیابی را شروع کنید
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* ... سایر فیلدهای فرم که بدون تغییر باقی می‌مانند ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">نام</Label>
                <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">نام خانوادگی</Label>
                <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} className="pl-10" required />
                  <Button type="button" variant="hrbooteh-ghost" size="icon-sm" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              {/* ✅ بخش تغییر یافته */}
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">تکرار رمز عبور</Label>
                <Input id="password_confirmation" name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange} required />
              </div>
            </div>

            <hr className="my-4 border-hrbooteh-surface-elevated" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">شماره تماس (اختیاری)</Label>
                <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">سن (اختیاری)</Label>
                <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education_level">سطح تحصیلات (اختیاری)</Label>
                <Input id="education_level" name="education_level" value={formData.education_level} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work_experience">سابقه کار (اختیاری)</Label>
                <Input id="work_experience" name="work_experience" value={formData.work_experience} onChange={handleChange} />
              </div>
            </div>

            <Button type="submit" variant="hrbooteh-gradient" size="lg" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? <LoaderCircle className="animate-spin" /> : 'ثبت‌نام'}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-hrbooteh-text-secondary text-sm">
              قبلاً ثبت‌نام کرده‌اید؟{" "}
              <button onClick={() => navigate('/login')} className="text-hrbooteh-primary hover:text-hrbooteh-primary-hover font-medium underline-offset-4 hover:underline transition-colors">
                وارد شوید
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;