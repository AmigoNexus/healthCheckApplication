import React, { useState } from "react";
import { addService } from "./apiServices";

export default function AddService({ onSuccess }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [frequency, setFrequency] = useState("minutes");
  const [interval, setInterval] = useState(5);
  const [time, setTime] = useState("09:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const convertToCron = () => {
    if (frequency === "minutes") return `0 0/${interval} * * * *`;
    if (frequency === "hours") return `0 0 0/${interval} * * *`;
    if (frequency === "daily") {
      const [h, m] = time.split(":");
      return `0 ${m} ${h} * * *`;
    }
    return "0 */5 * * * *";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cronExpression = convertToCron();
      await addService({ name, url, cronExpression });
      onSuccess?.();
    } catch {
      setError("Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white hover:border-gray-400";
  const selectCls = "w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition bg-white hover:border-gray-400";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border-l-4 border-red-500 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">📝 Service Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="e.g., My API, Database Server"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">🔗 Service URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputCls}
          placeholder="https://example.com/health"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">⏱️ Check Frequency</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className={selectCls}
        >
          <option value="minutes">Every N minutes</option>
          <option value="hours">Every N hours</option>
          <option value="daily">Daily at specific time</option>
        </select>
      </div>

      {(frequency === "minutes" || frequency === "hours") && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            🔢 Interval ({frequency === "minutes" ? "minutes" : "hours"})
          </label>
          <input
            type="number"
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className={inputCls}
            min="1"
            max={frequency === "minutes" ? "59" : "23"}
            required
          />
          <p className="text-xs text-sky-600 mt-2 bg-sky-50 p-2 rounded">
            📋 Cron: <code className="font-mono font-semibold">{convertToCron()}</code>
          </p>
        </div>
      )}

      {frequency === "daily" && (
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">🕐 Time of Day</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={inputCls}
            required
          />
          <p className="text-xs text-sky-600 mt-2 bg-sky-50 p-2 rounded">
            📋 Cron: <code className="font-mono font-semibold">{convertToCron()}</code>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:shadow-lg disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition duration-200"
      >
        {loading ? "⏳ Adding Service..." : "✓ Add Service"}
      </button>
    </form>
  );
}