import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventUpdateSchema } from "../schemas/eventSchemas";
import { eventAPI } from "../services/api";
import { getUser } from "../utils/auth";
import { toISOString, toDatetimeLocal } from "../utils/dateFormat";
import Button from "../components/Button";

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(eventUpdateSchema),
  });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setFetchingEvent(true);
      const response = await eventAPI.getEventById(id);
      const event = response.data;

      if (event.organizer_user_id !== currentUser?.id) {
        navigate(`/events/${id}`);
        return;
      }

      setValue("title", event.title);
      setValue("description", event.description || "");
      setValue("event_starts_at", toDatetimeLocal(event.event_starts_at));
      setValue("event_ends_at", toDatetimeLocal(event.event_ends_at));
    } catch (err) {
      console.error("Error fetching event:", err);
      setApiError(
        err.response?.data?.detail || "Failed to load event details."
      );
    } finally {
      setFetchingEvent(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setApiError("");

      const updateData = {};

      if (data.title) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.event_starts_at)
        updateData.event_starts_at = toISOString(data.event_starts_at);
      if (data.event_ends_at)
        updateData.event_ends_at = toISOString(data.event_ends_at);

      await eventAPI.updateEvent(id, updateData);
      navigate(`/events/${id}`);
    } catch (err) {
      console.error("Error updating event:", err);
      setApiError(
        err.response?.data?.detail ||
          "Failed to update event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Event
            </h1>
            <p className="text-gray-600">Update your event details</p>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                {...register("title")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter event description (optional)"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="event_starts_at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                id="event_starts_at"
                type="datetime-local"
                {...register("event_starts_at")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.event_starts_at && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.event_starts_at.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="event_ends_at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                id="event_ends_at"
                type="datetime-local"
                {...register("event_ends_at")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.event_ends_at && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.event_ends_at.message}
                </p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <Button type="submit" loading={loading} className="flex-1">
                Update Event
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/events/${id}`)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
