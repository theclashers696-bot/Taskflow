"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { forgetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      await forgetPassword({
        email: data.email,
        redirectTo: "/reset-password",
      });
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-sm text-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-lg mb-3">T</div>
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription className="text-slate-400">
            {sent ? "Check your inbox" : "We'll send you a reset link"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
              <p className="text-center text-slate-300 text-sm">
                If an account with that email exists, we sent a password reset link. Check your inbox and follow the instructions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-300">Email address</Label>
                <Input {...register("email")} type="email" placeholder="you@company.com" className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-blue-400" />
                {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
              </div>

              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 text-white" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <Link href="/login" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
