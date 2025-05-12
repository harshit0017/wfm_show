import { useEffect, useState } from 'react';

export default function Home() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/notion');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Consume flattened results from the API
        const data = Array.isArray(json.results) ? json.results : [];
        setRows(data);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="status-message">Loading…</p>;
  if (error)   return <p className="status-message error">Error: {error}</p>;

  return (
    <div className="container">
      <h1>Wolf Mentoring Top Interviews Till Date</h1>
      {rows.length === 0 ? (
        <p className="status-message">No interviews found.</p>
      ) : (
        <div className="table-wrapper">
          <table>
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
        /* Page styles */
        body {
          background-color: #f2f4f7;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem;
          background-color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
            Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        h1 {
          text-align: center;
          font-size: 2.75rem;
          color: #2c3e50;
          margin-bottom: 2rem;
          font-weight: 700;
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

        /* Table container and scroll */
        .table-wrapper {
          max-height: 600px;
          overflow-y: auto;
          overflow-x: auto;
          border: 1px solid #dfe3e8;
        }

        /* Table styles */
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }
        th,
        td {
          padding: 1rem 1.25rem;
          text-align: left;
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

        /* Remove border radii for blunt edges */
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
