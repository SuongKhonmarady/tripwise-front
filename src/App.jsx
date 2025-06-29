import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import GroupChatList from './pages/GroupChatList';
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
import { PrivateRoute } from './components/PrivateRoute'
import { TripProvider } from './context/TripContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/chat" element={
              <PrivateRoute>
                <Layout>
                  <GroupChatList />
                </Layout>
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
            
            {/* Redirect unknown routes to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
