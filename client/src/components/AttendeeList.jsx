import StatusBadge from "./StatusBadge";
import { formatDateTime } from "../utils/dateFormat";

const AttendeeList = ({ attendees }) => {
  if (!attendees || attendees.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No attendees yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attendees.map((attendee, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <p className="font-medium text-gray-900">
                {attendee.user?.username || "Unknown"}
              </p>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  attendee.role === "organizer"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {attendee.role === "organizer" ? "Organizer" : "Attendee"}
              </span>
            </div>
            <p className="text-sm text-gray-600">{attendee.user?.email}</p>
            {attendee.invited_at && (
              <p className="text-xs text-gray-500 mt-1">
                Invited {formatDateTime(attendee.invited_at)}
              </p>
            )}
          </div>
          <div>
            <StatusBadge status={attendee.status} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendeeList;
