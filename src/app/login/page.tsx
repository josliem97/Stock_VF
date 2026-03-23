import { login } from './actions'

export default async function LoginPage(props: {
  searchParams?: Promise<{ message?: string }>
}) {
  const searchParams = await props.searchParams

  return (
    <div className="flex-1 flex flex-col w-full px-8 justify-center gap-2 min-h-screen items-center mx-auto bg-slate-950">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-indigo-900/30 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[100px]" />
      </div>

      <div className="w-full sm:max-w-md bg-white/[0.03] p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] backdrop-blur-xl border border-white/10 z-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            VinFast
          </h1>
          <p className="text-slate-400 mt-3 text-sm font-medium tracking-wide uppercase">Inventory System</p>
        </div>

        <form className="flex-1 flex flex-col w-full justify-center gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider" htmlFor="email">
              Email Address
            </label>
            <input
              className="rounded-xl px-5 py-3.5 bg-slate-900/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
              name="email"
              placeholder="you@dealership.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <input
              className="rounded-xl px-5 py-3.5 bg-slate-900/50 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            formAction={login}
            className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
          
          {searchParams?.message && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-center rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {searchParams.message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
