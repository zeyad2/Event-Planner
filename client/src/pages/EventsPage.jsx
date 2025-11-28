import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { eventAPI } from "../services/api";
import { getUser } from "../utils/auth";
import EventCard from "../components/EventCard";
import Button from "../components/Button";

const EventsPage = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};

      // Map activeTab to user_role parameter
      if (activeTab === "organizer") {
        params.user_role = "organizer";
      } else if (activeTab === "attendee") {
        params.user_role = "user";
      }
      // "all" tab: don't send user_role param

      const response = await eventAPI.getEvents(params);
      setEvents(response.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      if (err.response?.status === 405) {
        setError("The event listing endpoint is not yet implemented on the backend. Please check back later.");
      } else {
        setError(
          err.response?.data?.detail || "Failed to load events. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function
  const getFilteredEvents = () => {
    let filtered = [...events];

    // 1. Keyword filter
    if (keyword.trim()) {
      const searchTerm = keyword.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm) ||
        (event.description?.toLowerCase().includes(searchTerm))
      );
    }

    // 2. Date filters
    if (startsAt) {
      const startDate = new Date(startsAt);
      filtered = filtered.filter(event =>
        new Date(event.event_starts_at) >= startDate
      );
    }

    if (endsAt) {
      const endDate = new Date(endsAt);
      filtered = filtered.filter(event =>
        new Date(event.event_ends_at) <= endDate
      );
    }

    // 3. Status filter for "All Events" tab only
    if (activeTab === "all" && currentUser?.role !== 'organizer') {
      // Regular users only see events they're going/maybe to, or events they organized
      filtered = filtered.filter(event =>
        event.is_organizer ||
        event.status === 'going' ||
        event.status === 'maybe'
      );
    }

    return filtered;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filters are applied client-side, so no need to re-fetch
  };

  const clearFilters = () => {
    setKeyword("");
    setStartsAt("");
    setEndsAt("");
  };

  // Get filtered events for display
  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Events</h1>
          {currentUser?.role === 'organizer' && (
            <Button onClick={() => navigate("/events/create")}>
              Create Event
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by title or description"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starts After
                </label>
                <input
                  type="date"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ends Before
                </label>
                <input
                  type="date"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button type="submit">Apply Filters</Button>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Events
            </button>
            {currentUser?.role === 'organizer' && (
              <button
                onClick={() => setActiveTab("organizer")}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "organizer"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Organized
              </button>
            )}
            <button
              onClick={() => setActiveTab("attendee")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "attendee"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Invited
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={fetchEvents}
              variant="danger"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "organizer"
                ? "You haven't organized any events yet."
                : activeTab === "attendee"
                ? "You haven't been invited to any events yet."
                : "You don't have any events yet."}
            </p>
            {currentUser?.role === 'organizer' && (
              <Button onClick={() => navigate("/events/create")}>
                Create Your First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
