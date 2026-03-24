"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { fadeUp, staggerContainer } from "@/lib/motion/variants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Create Supabase client once using useMemo
  const supabase = useMemo(() => createClient(), []);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/admin");
        router.refresh();
      }
    };
    checkAuth();
  }, [router, supabase]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Successful login - redirect to admin
        router.push("/admin");
        router.refresh();
      } else {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md px-4"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="border-[hsl(37,18%,89%)] backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <motion.div
            className="mx-auto w-16 h-16 rounded-full bg-[hsl(130,13%,56%)]/20 flex items-center justify-center mb-2"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 24, delay: 0.1 }}
          >
            <svg
              className="w-8 h-8 text-[hsl(130,13%,56%)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </motion.div>
          <CardTitle className="text-4xl font-heading">
            <span className="italic">KQ</span> Portal
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <motion.form
            onSubmit={handleLogin}
            className="space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="space-y-2" variants={fadeUp}>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                variant="pill"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </motion.div>
            <motion.div className="space-y-2" variants={fadeUp}>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                variant="pill"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </motion.div>
            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  className="text-sm text-[hsl(0,72%,51%)] bg-[hsl(0,72%,51%)]/10 px-4 py-2 rounded-full text-center"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.div variants={fadeUp}>
              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </motion.form>
          <p className="mt-6 text-center text-sm text-[hsl(145,15%,45%)]">
            Secure login for authorized administrators
          </p>
          <p className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-[hsl(145,15%,45%)] hover:text-[hsl(145,15%,35%)] underline underline-offset-2"
            >
              ← Back to main site
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
