import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import OfflineIndicator, { useOnlineStatus, useSyncStatus } from './components/OfflineIndicator'
import OfflineTestPanel from './components/OfflineTestPanel'
import GroupChatList from './pages/GroupChatList';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard'
import CreateTrip from './pages/CreateTrip'
import TripScheduler from './pages/TripScheduler'
import ExpenseTracker from './pages/ExpenseTracker'
import Categories from './pages/Categories'
import PackingList from './pages/PackingList'
import Collaborative from './pages/Collaborative'
import TripDetails from './pages/TripDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import TripChatPage from './pages/TripChatPage'
import Profile from './pages/Profile'
import EmailVerification from './pages/EmailVerification'
import { PrivateRoute } from './components/PrivateRoute'
import { TripProvider } from './context/TripContext'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'

function AppContent() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const { hasPendingSync } = useSyncStatus()
  
  // Check if offline indicator is visible
  const showOfflineIndicator = !isOnline || hasPendingSync || (wasOffline && isOnline && !hasPendingSync)

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      {/* Add padding to account for offline indicator when visible */}
      <div className={showOfflineIndicator ? 'pt-12' : ''}>
        <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              
              {/* Protected routes */}
              <Route path="/chat" element={
                <PrivateRoute>
                  <TripProvider>
                    <Layout>
                      <GroupChatList />
                    </Layout>
                  </TripProvider>
                </PrivateRoute>
              } />
            <Route path="/" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/create-trip" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <CreateTrip />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/scheduler" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <TripScheduler />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/expenses" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <ExpenseTracker />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/categories" element={
              <PrivateRoute>
                <Layout>
                  <Categories />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/packing" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <PackingList />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/collaborate" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <Collaborative />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/collaborate/:id" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <TripDetails />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/collaborative/manage/:id" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <Collaborative />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/chat/:id" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <TripChatPage />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <TripProvider>
                  <Layout>
                    <Profile />
                  </Layout>
                </TripProvider>
              </PrivateRoute>
            } />
            
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Debug Panel for Development */}
          <OfflineTestPanel />
        </div>
      </div>
    )
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <AppContent />
        </Router>
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
