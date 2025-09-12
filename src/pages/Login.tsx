// فایل کامل: mani-agah-esmaeilzad/hrbooteh-pathfinder/src/pages/Login.tsx
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

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "", // این فیلد می‌تواند نام کاربری یا ایمیل باشد
    password: ""
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiFetch('auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: formData.username, // API شما username یا email را در این فیلد قبول می‌کند
          password: formData.password
        }),
      });

      if (response.success && response.data.token) {
        // ذخیره توکن جدید در localStorage
        localStorage.setItem('authToken', response.data.token);
        
        toast.success("ورود موفقیت‌آمیز بود! در حال انتقال به داشبورد...");

        // انتقال به داشبورد
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } else {
        throw new Error(response.message || 'خطایی در ورود رخ داد');
      }
    } catch (error: any) {
      toast.error(error.message || 'خطای سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hrbooteh-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-hrbooteh-lg border-0 bg-hrbooteh-surface">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <Logo variant="large" />
          </div>
          <CardTitle className="text-2xl font-bold text-hrbooteh-text-primary">
            ورود به hrbooteh
          </CardTitle>
          <CardDescription className="text-hrbooteh-text-secondary">
            برای ادامه مسیر ارزیابی خود وارد شوید
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-hrbooteh-text-primary font-medium">
                نام کاربری یا ایمیل
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="نام کاربری یا ایمیل خود را وارد کنید"
                value={formData.username}
                onChange={handleChange}
                className="bg-hrbooteh-surface border-hrbooteh-surface-elevated focus:border-hrbooteh-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-hrbooteh-text-primary font-medium">
                رمز عبور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="رمز عبور خود را وارد کنید"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-hrbooteh-surface border-hrbooteh-surface-elevated focus:border-hrbooteh-primary pl-10"
                  required
                />
                <Button type="button" variant="hrbooteh-ghost" size="icon-sm" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <Button type="submit" variant="hrbooteh" size="lg" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? <LoaderCircle className="animate-spin" /> : 'ورود'}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-hrbooteh-text-secondary text-sm">
              حساب کاربری ندارید؟{" "}
              <button onClick={() => navigate('/register')} className="text-hrbooteh-primary hover:text-hrbooteh-primary-hover font-medium underline-offset-4 hover:underline transition-colors">
                ثبت‌نام کنید
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;