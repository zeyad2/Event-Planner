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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">Event Planner</h1>
        <p className="text-xl text-gray-600 mb-8">Plan and manage your events with ease</p>

        {isLoggedIn ? (
          <div className="space-y-4">
            <p className="text-2xl text-gray-700">
              Welcome back, <span className="font-bold text-blue-600">{user?.username || 'User'}</span>!
            </p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-600 transition duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition duration-200 border-2 border-blue-600"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transition duration-200"
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
