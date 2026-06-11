import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "../ui/button";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLogin, type ApiError } from "../../api/auth";
import type { AxiosError } from "axios";
import { useAuth } from "../../lib/auth-context";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginForm() {
  const loginMutation = useLogin();
  const { login } = useAuth();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginSchema) => {
    loginMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: (data) => {
          toast.success("Redirecting...");
          login(data.access_token, data.role);
          navigate("/candidates", { replace: true });
        },

        onError: (err: AxiosError<ApiError>) => {
          const message = err.response?.data?.detail || "Something went wrong";

          if (err.response?.status === 401) {
            toast.error("Invalid email or password");
          } else if (err.response?.status === 403) {
            toast.error("Please verify your email address");
          } else {
            toast.error(message);
          }
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-xl">
        <div className="flex flex-col items-center space-y-8">
          <img src="/logo.svg" alt="logo" width={220} height={220} />

          {searchParams.toString() && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-500">
              {searchParams.get("message")}
            </div>
          )}

          <FieldGroup className="w-full">
            <Field>
              <FieldLabel htmlFor="email" className="text-[#c7c7c7]">
                Email
              </FieldLabel>
              <div className="relative w-full">
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="bg-surface border-[#c7c7c7] w-full rounded-xl border px-4 py-3.5 pr-14 text-[#19275A] placeholder-[#c7c7c7] outline-none focus:ring focus:ring-[#19275A]"
                  placeholder="Enter your email"
                />
                <div className="absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2">
                  <img src="/mail.svg" alt="mail icon" />
                </div>
              </div>

              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="text-[#c7c7c7]">
                Password
              </FieldLabel>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className="bg-surface border-[#c7c7c7] w-full rounded-xl border px-4 py-3.5 pr-14 text-[#19275A] placeholder-[#c7c7c7] outline-none focus:ring focus:ring-[#19275A]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2 cursor-pointer"
                >
                  <img
                    src={showPassword ? "/eye1.svg" : "/eye.svg"}
                    alt="toggle password"
                  />
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full bg-[#19275A] text-normal text-md cursor-pointer rounded-full text-white font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </Field>

            <div className="text-center text-[#C7C7C7] text-sm mt-4">
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="text-[#19275A] hover:underline"
              >
                Register
              </Link>
            </div>
          </FieldGroup>
        </div>
      </form>
    </div>
  );
}
