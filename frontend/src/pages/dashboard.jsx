import React, { useEffect, useState, useCallback } from "react";
import { getStatuses, getPingHistory, deleteService } from "../services/apiServices";
import AddService from "../services/addService";
import PingCheck from "./components/pingCheck";
import ConfirmDialog from "./components/confirmDialog";

const REFRESH_INTERVAL = 30000;

export default function Dashboard({ viewType }) {
  const [services, setServices] = useState([]);
  const [pingChecks, setPingChecks] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [showPingCheck, setShowPingCheck] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteServiceId, setDeleteServiceId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await getStatuses();
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch health statuses", err);
    }
  }, []);

  const fetchPing = useCallback(async () => {
    try {
      const res = await getPingHistory();
      setServices([]);
      setPingChecks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch ping history", err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const fetch = viewType === "health" ? fetchHealth : fetchPing;
    fetch().finally(() => setLoading(false));

    const interval = setInterval(fetch, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [viewType, fetchHealth, fetchPing]);

  const handleServiceAdded = () => {
    setShowAddService(false);
    fetchHealth();
  };

  const handlePingDone = () => {
    setShowPingCheck(false);
    fetchPing();
  };

  const handleDelete = (id) => {
    setDeleteServiceId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteService(deleteServiceId);
      setServices((prev) => prev.filter((s) => s.id !== deleteServiceId));
      setShowDeleteDialog(false);
      setDeleteServiceId(null);
    } catch {
      setShowDeleteDialog(false);
      setErrorMessage("Failed to delete service. Please try again.");
      setShowErrorDialog(true);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const upCount = services.filter((s) => s.status === "UP").length;
  const downCount = services.filter((s) => s.status === "DOWN").length;

  const convertCronToReadable = (cronExpression) => {
    if (!cronExpression) return null;

    const parts = cronExpression.split(" ");

    if (parts[2] === "*" && parts[3] === "*" && parts[4] === "*" && parts[5] === "*") {
      const minutePart = parts[1];
      if (minutePart.startsWith("0/")) {
        const interval = parseInt(minutePart.substring(2));
        return interval === 1 ? "Every minute" : `Every ${interval} minutes`;
      }
    }

    if (parts[1] === "0" && parts[3] === "*" && parts[4] === "*" && parts[5] === "*") {
      const hourPart = parts[2];
      if (hourPart.startsWith("0/")) {
        const interval = parseInt(hourPart.substring(2));
        return interval === 1 ? "Every hour" : `Every ${interval} hours`;
      }
    }

    if (parts[3] === "*" && parts[4] === "*" && parts[5] === "*") {
      const hour = parseInt(parts[2]);
      const minute = parseInt(parts[1]);
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      return `Daily at ${time}`;
    }

    return cronExpression;
  };

  return (
    <div className="flex-grow p-6">

      {viewType === "health" && (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-start md:items-center gap-4 mb-6 flex-col md:flex-row">
              <div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2">Service Health Status</h2>
                {!loading && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>{upCount} UP
                    </span>
                    <span className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold">
                      <span className="w-2 h-2 bg-red-600 rounded-full"></span>{downCount} DOWN
                    </span>
                    <span className="flex items-center gap-2 bg-sky-100 text-sky-500 px-3 py-1.5 rounded-full font-semibold">
                      🔄 Auto-refresh 30s
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAddService(true)}
                className="bg-gradient-to-r from-sky-300 to-sky-400 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-xl">+</span> Add Service
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : services.length === 0 ? (
            <EmptyState message="No services added yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  onDelete={() => handleDelete(s.id)}
                  formatDateTime={formatDateTime}
                  convertCronToReadable={convertCronToReadable}
                />
              ))}
            </div>
          )}
        </>
      )}

      {viewType === "ping" && (
        <>
          <div className="mb-8">
            <div className="flex justify-between items-start md:items-center gap-4 mb-6 flex-col md:flex-row">
              <h2 className="text-4xl font-bold text-slate-800">Ping Check History</h2>
              <button
                onClick={() => setShowPingCheck(true)}
                className="bg-gradient-to-r from-sky-300 to-sky-400 text-white px-6 py-3 rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <span className="text-xl">+</span> New Ping Check
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : pingChecks.length === 0 ? (
            <EmptyState message="No ping checks yet. Try running a new one!" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pingChecks.map((p) => (
                <PingCard key={p.id} ping={p} formatDateTime={formatDateTime} />
              ))}
            </div>
          )}
        </>
      )}

      {showAddService && (
        <Modal title="Add New Service" onClose={() => setShowAddService(false)}>
          <AddService onSuccess={handleServiceAdded} />
        </Modal>
      )}

      {showPingCheck && (
        <Modal title="New Ping Check" onClose={() => setShowPingCheck(false)}>
          <PingCheck onSuccess={handlePingDone} />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setDeleteServiceId(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmDialog
        isOpen={showErrorDialog}
        title="Error"
        message={errorMessage}
        onConfirm={() => setShowErrorDialog(false)}
        onCancel={() => setShowErrorDialog(false)}
        confirmText="OK"
        cancelText=""
      />
    </div>
  );
}

function ServiceCard({ service: s, onDelete, formatDateTime, convertCronToReadable }) {
  const isUp = s.status === "UP";
  return (
    <div className={`relative group rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 ${isUp ? "bg-gradient-to-br from-green-50 to-green-100 border-green-500" : "bg-gradient-to-br from-red-50 to-red-100 border-red-500"}`}>
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all p-2 bg-white rounded-lg shadow-md hover:shadow-lg"
        title="Delete service"
      >
        <span className="text-lg">✕</span>
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${isUp ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {isUp ? "✓ ACTIVE" : "✗ DOWN"}
          </div>
        </div>
        <h3 className={`text-lg font-bold leading-tight mb-2 ${isUp ? "text-green-900" : "text-red-900"}`}>{s.name}</h3>
        <p className={`text-sm break-all mb-4 font-mono ${isUp ? "text-green-800" : "text-red-800"}`}>{s.url}</p>

        <div className="space-y-2 pt-3 border-t border-gray-300 border-opacity-40">
          <div className="flex justify-between items-center text-xs">
            <span className={`font-medium ${isUp ? "text-green-700" : "text-red-700"}`}>Last Checked</span>
            <span className={`${isUp ? "text-green-800" : "text-red-800"}`}>{formatDateTime(s.lastChecked)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className={`font-medium ${isUp ? "text-green-700" : "text-red-700"}`}>Next Check</span>
            <span className={`${isUp ? "text-green-800" : "text-red-800"}`}>{formatDateTime(s.nextCheck)}</span>
          </div>
          {s.cronExpression && (
            <div className="flex justify-between items-center text-xs pt-2">
              <span className={`font-medium ${isUp ? "text-green-700" : "text-red-700"}`}>📅 Schedule</span>
              <span className={`font-semibold ${isUp ? "text-green-900" : "text-red-900"}`}>{convertCronToReadable(s.cronExpression)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PingCard({ ping: p, formatDateTime }) {
  const isUp = p.status === "UP";
  return (
    <div className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 ${isUp ? "bg-gradient-to-br from-green-50 to-green-100 border-green-500" : "bg-gradient-to-br from-red-50 to-red-100 border-red-500"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${isUp ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {isUp ? "✓ SUCCESS" : "✗ FAILED"}
          </div>
        </div>
        <h3 className={`text-lg font-bold leading-tight mb-2 ${isUp ? "text-green-900" : "text-red-900"}`}>{p.name}</h3>
        <p className={`text-sm break-all mb-4 font-mono ${isUp ? "text-green-800" : "text-red-800"}`}>{p.url}</p>

        <div className="space-y-2 pt-3 border-t border-gray-300 border-opacity-40">
          <div className="flex justify-between items-center text-xs">
            <span className={`font-medium ${isUp ? "text-green-700" : "text-red-700"}`}>Response Time</span>
            <span className={`font-semibold ${isUp ? "text-green-900" : "text-red-900"}`}>${p.responseTime ?? "N/A"} ms</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className={`font-medium ${isUp ? "text-green-700" : "text-red-700"}`}>Checked At</span>
            <span className={`${isUp ? "text-green-800" : "text-red-800"}`}>{formatDateTime(p.checkedAt)}</span>
          </div>
          {p.message && (
            <div className="pt-2">
              <span className={`text-xs font-medium ${isUp ? "text-green-700" : "text-red-700"}`}>💬 Message</span>
              <p className={`text-xs mt-1 truncate ${isUp ? "text-green-800" : "text-red-800"}`} title={p.message}>{p.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-sky-100">
          <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-100 rounded-lg transition text-red-500 hover:text-red-700 font-bold text-lg"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl animate-pulse shadow-lg"
        />
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl">
      <div className="text-6xl mb-4">📭</div>
      <p className="text-xl text-slate-600 font-semibold text-center">{message}</p>
      <p className="text-sm text-slate-500 mt-2 text-center">Get started by adding your first service or ping check</p>
    </div>
  );
}