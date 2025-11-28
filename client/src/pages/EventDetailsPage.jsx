import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventAPI } from "../services/api";
import { getUser } from "../utils/auth";
import { formatDateTime } from "../utils/dateFormat";
import Button from "../components/Button";
import Modal from "../components/Modal";
import AttendeeList from "../components/AttendeeList";
import StatusBadge from "../components/StatusBadge";

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [myStatus, setMyStatus] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const eventResponse = await eventAPI.getEventById(id);
      setEvent(eventResponse.data);

      // Check if user is invited by looking at event invitations
      // For attendees, they can't fetch the full attendee list (403), but we can check their own status
      if (eventResponse.data.organizer_user_id === currentUser?.id) {
        // Organizer can see full attendee list
        try {
          const attendeesResponse = await eventAPI.getEventAttendees(id);
          setAttendees(attendeesResponse.data || []);
        } catch (attendeeError) {
          console.error("Error fetching attendees:", attendeeError);
        }
      } else {
        // For regular users, set a default pending status to show RSVP buttons
        // The actual status will be updated when they RSVP
        setMyStatus("pending");
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setError(
        err.response?.data?.detail || "Failed to load event details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await eventAPI.deleteEvent(id);
      navigate("/events");
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(err.response?.data?.detail || "Failed to delete event.");
      setIsDeleteModalOpen(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    const emails = inviteEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    if (emails.length === 0) {
      setInviteError("Please enter at least one email address");
      return;
    }

    try {
      const response = await eventAPI.inviteToEvent(id, emails);
      setInviteSuccess(
        `Successfully invited ${response.data.invited_emails.length} user(s)`
      );
      setInviteEmails("");
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess("");
        fetchEventDetails();
      }, 2000);
    } catch (err) {
      console.error("Error inviting users:", err);
      setInviteError(
        err.response?.data?.detail || "Failed to send invitations."
      );
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusUpdating(true);
      await eventAPI.updateAttendanceStatus(id, newStatus);
      setMyStatus(newStatus);
      fetchEventDetails();
    } catch (err) {
      console.error("Error updating status:", err);
      setError(
        err.response?.data?.detail || "Failed to update attendance status."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const isOrganizer = event?.organizer_user_id === currentUser?.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/events")}>Back to Events</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate("/events")}
          className="mb-6"
        >
          ← Back to Events
        </Button>

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
              <div className="flex items-center space-x-3">
                {isOrganizer ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Organizer
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Attendee
                  </span>
                )}
                {myStatus && <StatusBadge status={myStatus} />}
              </div>
            </div>
            {isOrganizer && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => navigate(`/events/${id}/edit`)}
                  variant="outline"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="danger"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Description
              </h3>
              <p className="text-gray-900">
                {event.description || "No description provided"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Starts
                </h3>
                <p className="text-gray-900">
                  {formatDateTime(event.event_starts_at)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Ends
                </h3>
                <p className="text-gray-900">
                  {formatDateTime(event.event_ends_at)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Created
                </h3>
                <p className="text-gray-900">
                  {formatDateTime(event.created_at)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Last Updated
                </h3>
                <p className="text-gray-900">
                  {formatDateTime(event.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {!isOrganizer && myStatus && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Your Response
              </h3>
              <div className="flex space-x-3">
                <Button
                  variant={myStatus === "going" ? "primary" : "outline"}
                  onClick={() => handleStatusChange("going")}
                  disabled={statusUpdating}
                >
                  Going
                </Button>
                <Button
                  variant={myStatus === "maybe" ? "primary" : "outline"}
                  onClick={() => handleStatusChange("maybe")}
                  disabled={statusUpdating}
                >
                  Maybe
                </Button>
                <Button
                  variant={myStatus === "not_going" ? "danger" : "outline"}
                  onClick={() => handleStatusChange("not_going")}
                  disabled={statusUpdating}
                >
                  Not Going
                </Button>
              </div>
            </div>
          )}
        </div>

        {isOrganizer && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Attendees ({attendees.length})
              </h2>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                Invite Attendees
              </Button>
            </div>
            <AttendeeList attendees={attendees} />
          </div>
        )}

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Event"
        >
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this event? This action cannot be
            undone.
          </p>
          <div className="flex space-x-3">
            <Button onClick={handleDelete} variant="danger" className="flex-1">
              Delete
            </Button>
            <Button
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            setInviteEmails("");
            setInviteError("");
            setInviteSuccess("");
          }}
          title="Invite Attendees"
        >
          <form onSubmit={handleInvite}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Addresses
              </label>
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email addresses separated by commas"
              />
              <p className="text-sm text-gray-500 mt-1">
                Example: user1@example.com, user2@example.com
              </p>
            </div>

            {inviteError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-600 text-sm">{inviteError}</p>
              </div>
            )}

            {inviteSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-green-600 text-sm">{inviteSuccess}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button type="submit" className="flex-1">
                Send Invites
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteEmails("");
                  setInviteError("");
                  setInviteSuccess("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default EventDetailsPage;
