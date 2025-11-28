import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAuthenticated, getUser, clearAuth } from '../utils/auth.jsx'

const HomePage = () => {
  const navigate = useNavigate()
  const isLoggedIn = isAuthenticated()
  const user = isLoggedIn ? getUser() : null

  const handleLogout = () => {
    clearAuth()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Event Planner</h1>
        <p className="text-xl text-gray-600 mb-8">Plan and manage your events with ease</p>

        {isLoggedIn ? (
          <div className="space-y-6">
            <p className="text-2xl text-gray-700">
              Welcome back, <span className="font-bold text-blue-600">{user?.username || 'User'}</span>!
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/events')}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition"
              >
                View Events
              </button>
              {user?.role === 'organizer' && (
                <button
                  onClick={() => navigate('/events/create')}
                  className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-md border border-blue-600 hover:bg-blue-50 transition"
                >
                  Create Event
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-md border border-blue-600 hover:bg-blue-50 transition"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
