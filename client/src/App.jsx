import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import EventsPage from './pages/EventsPage.jsx'
import CreateEventPage from './pages/CreateEventPage.jsx'
import EventDetailsPage from './pages/EventDetailsPage.jsx'
import EditEventPage from './pages/EditEventPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Navigation from './components/Navigation.jsx'

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/create"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute>
              <EditEventPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
