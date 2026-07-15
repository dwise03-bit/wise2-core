'use client';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-wise flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-wise-primary mb-2">WISE²</h1>
          <p className="text-wise-muted">Create your account</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-wise-primary mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 bg-wise-surface border border-wise-subtle rounded-md text-wise-primary placeholder-wise-muted focus:outline-none focus:border-wise-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-wise-primary mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 bg-wise-surface border border-wise-subtle rounded-md text-wise-primary placeholder-wise-muted focus:outline-none focus:border-wise-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-wise-muted text-sm">
            Already have an account?{' '}
            <a href="/auth/login" className="text-wise-primary hover:text-wise-primary-hover">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-wise-subtle">
          <button className="w-full py-2 border border-wise-subtle hover:border-wise-primary text-wise-primary rounded-md transition-colors">
            Continue with Google
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-wise-muted">
          <a href="/" className="hover:text-wise-primary">← Back to home</a>
        </div>
      </div>
    </div>
  );
}
