const StatusBadge = ({ status }) => {
  const statusConfig = {
    going: {
      label: "Going",
      className: "bg-green-100 text-green-800",
    },
    maybe: {
      label: "Maybe",
      className: "bg-yellow-100 text-yellow-800",
    },
    not_going: {
      label: "Not Going",
      className: "bg-red-100 text-red-800",
    },
    pending: {
      label: "Pending",
      className: "bg-gray-100 text-gray-800",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
