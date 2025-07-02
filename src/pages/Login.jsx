import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import GoogleSignIn from '../components/GoogleSignIn'

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const { login, googleLogin, loading, error, clearError, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(formData)
    } catch (error) { }
  }

  const handleGoogleSuccess = async (credential) => {
    try {
      await googleLogin(credential)
    } catch (error) {
      console.error('Google login failed:', error)
    }
  }

  const handleGoogleError = (error) => {
    console.error('Google login error:', error)
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, from, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4 py-10">
      <div className="absolute top-6 left-6">
        <Link to="/" className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm bg-white/80 rounded-full px-3 py-1 shadow border border-blue-100 transition">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Home
        </Link>
      </div>
      <div className="w-full max-w-lg mx-auto bg-white/90 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col gap-8 border border-blue-100">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-blue-600 rounded-full p-3 shadow mb-2">
            <LogIn className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-700 tracking-tight mb-1">Sign in to TripWise</h2>
        </div>
        
        {/* Google Sign In */}
        <div className="w-full">
          <GoogleSignIn 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="Sign in with Google"
          />
        </div>
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="on">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-700 mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-4 py-2 border border-blue-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 shadow-sm transition"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-700 mb-1">Password</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full px-4 py-2 pr-12 border border-blue-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 shadow-sm transition"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-blue-500 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* ...existing code... */}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-full text-white font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-base mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <div className="mt-2 text-xs md:text-sm text-gray-600 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline font-medium">Sign up</Link>
        </div>
        <div className="text-xs text-gray-400 text-center mt-4">&copy; {new Date().getFullYear()} TripWise. All rights reserved.</div>
      </div>
    </div>
  )
}
