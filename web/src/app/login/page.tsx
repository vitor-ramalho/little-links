'use client';

import { login } from '../auth/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// LoginButton component with loading state
function LoginButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging in...
        </>
      ) : (
        'Log in'
      )}
    </Button>
  );
}

export default function LoginPage() {
  // Initial state for the form
  const initialState = {
    errors: {},
    message: '',
    success: false
  };
  
  // Use form state with the login action
  const [state, formAction] = useFormState(login, initialState);
  
  // Handle token storage and redirection
  const router = useRouter();

  useEffect(() => {
    if (state.token) {
      localStorage.setItem('auth_token', state.token);
      
      // If user data is available, save that too
      if (state.user) {
        localStorage.setItem('user', JSON.stringify(state.user));
      }

      // Handle redirection if specified
      if (state.redirectTo) {
        router.push(state.redirectTo);
      }
    }
  }, [state.token, state.user, state.redirectTo, router]);
  
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className={state.errors?.email ? "border-red-500" : ""}
                />
                {state.errors?.email && (
                  <p className="text-sm text-red-500">{state.errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={state.errors?.password ? "border-red-500" : ""}
                />
                {state.errors?.password && (
                  <p className="text-sm text-red-500">{state.errors.password}</p>
                )}
              </div>
              
              {state.message && !state.success && (
                <div className="rounded-md bg-red-50 p-2 text-sm text-red-500">
                  {state.message}
                </div>
              )}
              
              {state.message && state.success && (
                <div className="rounded-md bg-green-50 p-2 text-sm text-green-600">
                  {state.message}
                </div>
              )}
              
              <LoginButton />
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
