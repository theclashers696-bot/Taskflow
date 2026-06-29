"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signUp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const result = await signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (result.error) {
        toast.error(result.error.message || "Sign up failed");
      } else {
        toast.success("Account created! Welcome to TaskFlow.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-sm text-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg mb-3">T</div>
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription className="text-slate-400">Start managing tasks with your team today</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button type="button" variant="outline" className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white" onClick={handleGoogleSignIn}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs text-slate-500"><span className="bg-transparent px-2">or sign up with email</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Full Name</Label>
              <Input {...register("name")} placeholder="Jane Smith" className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-400" />
              {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Email</Label>
              <Input {...register("email")} type="email" placeholder="you@company.com" className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-400" />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Password</Label>
              <Input {...register("password")} type="password" placeholder="Min. 8 characters" className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-400" />
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300">Confirm Password</Label>
              <Input {...register("confirmPassword")} type="password" placeholder="••••••••" className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-400" />
              {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 text-white" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
