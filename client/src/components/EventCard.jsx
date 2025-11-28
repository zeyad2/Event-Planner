import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../utils/dateFormat";
import StatusBadge from "./StatusBadge";

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };

  const getRoleBadge = () => {
    if (event.is_organizer) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Organizer
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Attendee
        </span>
      );
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition p-6 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {event.title}
        </h3>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
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
          {formatDateTime(event.event_starts_at)}
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {getRoleBadge()}
        {event.status && <StatusBadge status={event.status} />}
      </div>
    </div>
  );
};

export default EventCard;
