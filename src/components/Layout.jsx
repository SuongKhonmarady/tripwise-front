import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOnlineStatus } from '../hooks/useOffline'
import { 
  LayoutDashboard, 
  Calendar, 
  DollarSign, 
  Package, 
  Users, 
  Menu, 
  X,
  Plane,
  User,
  LogOut,
  ChevronDown,
  Tag,
  Plus,
  MessageCircle,
  WifiOff
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Create Trip', href: '/create-trip', icon: Plus },
  { name: 'Trip Scheduler', href: '/scheduler', icon: Calendar },
  { name: 'Expense Tracker', href: '/expenses', icon: DollarSign },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Packing List', href: '/packing', icon: Package },
  { name: 'Collaborative', href: '/collaborate', icon: Users },
  { name: 'Group Chat', href: '/chat', icon: MessageCircle },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { isOnline } = useOnlineStatus()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
        
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">TripWise</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-4 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:w-64 lg:flex lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center px-6 py-4 border-b">
            <Plane className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">TripWise</span>
            {!isOnline && (
              <div className="ml-3 px-2 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center space-x-1">
                <WifiOff className="h-3 w-3" />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
          </div>
          
          <nav className="mt-6 flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User menu in sidebar */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header - Fixed to top */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-primary-600" />
            <span className="text-lg font-bold text-gray-900">TripWise</span>
            {!isOnline && (
              <div className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded-full flex items-center space-x-1">
                <WifiOff className="h-3 w-3" />
                <span className="text-xs font-medium">Offline</span>
              </div>
            )}
          </div>
          
          {/* Mobile user menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-1 p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <User className="h-6 w-6" />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop header - Fixed to top */}
        <div className="hidden lg:sticky lg:top-0 lg:z-30 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-4 lg:bg-white lg:border-b lg:shadow-sm">
          <div className="flex-1">
            {/* Page title or breadcrumbs can go here */}
          </div>
          
          {/* Desktop user menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
