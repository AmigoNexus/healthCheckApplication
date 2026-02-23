import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PingHistoryPage() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get(`/api/ping-history/${id}`)
      .then((res) => setHistory(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Ping History</h2>
      {history.length === 0 ? (
        <p>No history found</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border px-2 py-1">Time</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Message</th>
              <th className="border px-2 py-1">Response Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id}>
                <td className="border px-2 py-1">{new Date(h.checkedAt).toLocaleString()}</td>
                <td className="border px-2 py-1">{h.status}</td>
                <td className="border px-2 py-1">{h.message}</td>
                <td className="border px-2 py-1">{h.responseTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
