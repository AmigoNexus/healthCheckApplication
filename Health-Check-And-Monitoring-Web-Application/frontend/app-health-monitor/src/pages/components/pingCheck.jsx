import React, { useState } from "react";
import { pingService } from "../../services/apiServices";

export default function PingCheck({ onSuccess }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePing = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await pingService({ name, url });
      setResult(res.data);
      onSuccess?.();
    } catch (err) {
      setError("Ping failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-300";

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handlePing} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Service Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="My API"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Service URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={inputCls}
            placeholder="https://example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 disabled:bg-sky-300 transition"
        >
          {loading ? "Pinging..." : "Ping Now"}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-4 rounded-lg border-2 ${result.status === "UP" ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-2xl`}>{result.status === "UP" ? "✅" : "❌"}</span>
            <span className={`font-bold text-lg ${result.status === "UP" ? "text-green-700" : "text-red-700"}`}>
              {result.status}
            </span>
          </div>
          {result.responseTime != null && (
            <p className="text-sm text-gray-600">Response Time: <strong>{result.responseTime} ms</strong></p>
          )}
          {result.message && (
            <p className="text-sm text-gray-500 mt-1">Message: {result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}