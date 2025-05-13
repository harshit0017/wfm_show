import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Recursive fetcher: grabs one “page” (up to 100 rows) at a time
    const fetchPage = async (cursor = null, isFirst = true) => {
      try {
        const qs = cursor ? `?cursor=${cursor}` : '';
        const res = await fetch(`/api/notion${qs}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { results, nextCursor } = await res.json();

        if (!isMounted) return;
        // append new batch
        setRows(prev => [...prev, ...results]);
        // after first batch arrives, hide the full‐page spinner
        if (isFirst) setLoading(false);

        // if there's more, fetch the next batch (quietly)
        if (nextCursor) {
          fetchPage(nextCursor, false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) {
          setError(e.message);
          setLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="status-message">Loading…</p>
        <style jsx>{`
          .loading-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            background-color: #f2f4f7;
            z-index: 999;
          }
          .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #e0e0e0;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .status-message {
            text-align: center;
            color: #7f8c8d;
            font-size: 1.25rem;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return <p className="status-message error">Error: {error}</p>;
  }

  return (
    <div className="container">
    {/* ─── HEADER WITH BUTTON ─────────────────────────────── */}
    <div className="header">
      <h1>Wolf Mentoring Top Interviews Till Date</h1>
      <Link href="/book-call" legacyBehavior>
        <a className="call-button">BOOK A CALL NOW</a>
      </Link>
    </div>
      {rows.length === 0 ? (
        <p className="status-message">No interviews found.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <colgroup>
              <col style={{ width: '50%' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '20%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td>
                    <a href={row.url} target="_blank" rel="noopener noreferrer">
                      {row.title}
                    </a>
                  </td>
                  <td>{row.company}</td>
                  <td>{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
         /* ── Container + Header ── */
        .container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background: #fff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
            sans-serif;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        h1 {
          font-size: 2.5rem;
          color: #2c3e50;
          margin: 0;
          font-weight: 700;
        }

        /* ── Beautiful Pill Button ── */
        .call-button {
          display: inline-block;
          background: linear-gradient(135deg, #6c63ff, #3f3cfd);
          color: #fff;
          padding: 0.75rem 1.75rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 9999px;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: background 0.3s ease,
                      transform 0.2s ease,
                      box-shadow 0.2s ease;
        }
        .call-button:hover {
          background: linear-gradient(135deg, #5a52e6, #3430e0);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        .call-button:active {
          transform: translateY(0);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
        }

        .status-message {
          text-align: center;
          color: #7f8c8d;
          font-size: 1.125rem;
          margin-top: 2rem;
        }
        .status-message.error {
          color: #c0392b;
        }

        .container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 2rem;
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
       

        .table-wrapper {
          max-height: 600px;
          overflow-y: auto;
          border: 1px solid #dfe3e8;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        th,
        td {
          padding: 1rem 1.25rem;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        th {
          background: #2c3e50;
          color: #ffffff;
          font-weight: 600;
          border-bottom: 2px solid #1a252f;
        }
        tbody tr {
          border-bottom: 1px solid #dfe3e8;
        }
        tbody tr:nth-child(even) {
          background: #f9fbfc;
        }
        tbody tr:hover {
          background: #eaeff2;
        }
        a {
          color: #2980b9;
          text-decoration: none;
          font-weight: 500;
        }
        a:hover {
          text-decoration: underline;
        }

        .container,
        .table-wrapper,
        table,
        th,
        td {
          border-radius: 0;
        }
      `}</style>
    </div>
  );
}
