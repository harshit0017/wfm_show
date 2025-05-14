import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchPage = async (cursor = null, isFirst = true) => {
      try {
        const qs = cursor ? `?cursor=${cursor}` : '';
        const res = await fetch(`/api/notion${qs}`);
      
        console.log("✅ Fetched data:", res);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { results, nextCursor } = await res.json();
        if (!isMounted) return;
        setRows(prev => [...prev, ...results]);
        if (isFirst) setLoading(false);
        if (nextCursor) fetchPage(nextCursor, false);
      } catch (e) {
        console.error(e);
        if (isMounted) {
          setError(e.message);
          setLoading(false);
        }
      }
    };
    fetchPage();
    return () => { isMounted = false; };
  }, []);

  // filter rows by company name
  const filteredRows = rows.filter(r =>
    r.company.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  if (loading) {
    return (
     
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="status-message">Fetching wisdom from the best minds…</p>
  
        <style jsx>{`
          .loading-container {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: #f5f7fa;
          }
  
          .spinner {
            border: 6px solid #e0e0e0;
            border-top: 6px solid #6c63ff;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
          }
  
          @keyframes spin {
            0%   { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
  
          .status-message {
            margin-top: 1.25rem;
            font-size: 1.125rem;
            font-weight: 500;
            color: #333;
          }
        `}</style>
      </div>
    );
  }
  
  if (error) {
    return <p className="status-message error">Error: {error}</p>;
  }

  return (
    <div className="main-wrapper">
      {/* LEFT: Table and Header */}
      <div className="left-content">
      <div className="header-section">
        <h1>🚀 Wolf Mentoring Service</h1>
        <p className="subtext">Top Interviews Till Date — Learn from the best, grow your career</p>
      </div>

        {/* SEARCH BAR */}
        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by company…"
          />
        </div>
  
        {/* TABLE OR EMPTY */}
        {filteredRows.length === 0 ? (
          <p className="status-message">
            {searchTerm ? 'No matching companies found.' : 'No interviews found.'}
          </p>
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
                {filteredRows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.title}</td>
                    <td>{row.company}</td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  
      {/* RIGHT: Call to Action */}
      <div className="right-sidebar">
        <div className="cta-container">
          <p className="cta-text">Best mentoring for your career.</p>
          <Link href="/book-call" legacyBehavior>
            <a className="call-button">BOOK A CALL NOW</a>
          </Link>
        </div>
      </div>

      {/* Compact mobile CTA (only visible on small screens) */}
      <div className="mobile-cta-strip">
        <Link href="/book-call" legacyBehavior>
          <a className="mobile-call-button">BOOK A CALL NOW</a>
        </Link>
      </div>

  
      <style jsx>{`
          :global(body) {
              font-family: 'Poppins', sans-serif;
              background: #F9FAFB;
              color: #111827;
              margin: 0;
              padding: 0;
            }


          .header-section {
            text-align: center;
            margin-bottom: 2rem;
          }

          .header-section h1 {
            font-size: 2.75rem;
            font-weight: 800;
            background: linear-gradient(to right,rgb(3, 3, 3),rgb(5, 5, 5));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
          }

          .subtext {
            font-size: 1.25rem;
            color: #4B5563;
            margin-top: 0.5rem;
            font-weight: 500;
          }

          .main-wrapper {
            display: flex;
            flex-direction: row;
            max-width: 1200px;
            margin: 2rem auto;
            gap: 2rem;
            padding: 0 1rem;
            
            min-height: 100vh; /* ⬅️ Add this to allow vertical centering */
            align-items: stretch; /* Make children (like sidebar) fill height */

          }

          .left-content {
            flex: 4;
          }

          .right-sidebar {
            flex: 1.2;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            min-width: 260px;
          }

          .cta-container {
            width: 100%;
            max-width: 260px;
            background: #FFFFFF;
            padding: 2rem 1.5rem;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border: 1px solid #E5E7EB;
          }

          .cta-text {
            font-size: 1.125rem;
            margin-bottom: 1rem;
            color: #374151;
            font-weight: 600;
            line-height: 1.6;
          }

          .call-button {
            display: inline-block;
            background: linear-gradient(to right, #F8C319, #F8C319);
            color: #111;
            padding: 0.75rem 1.75rem;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 9999px;
            text-decoration: none;
            box-shadow: 0 6px 18px rgba(215, 223, 128, 0.3);
            transition: background 0.3s ease, transform 0.2s ease;
          }

          .call-button:hover {
            background: linear-gradient(to right,rgb(224, 229, 70),rgb(228, 240, 59));
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(230, 243, 184, 0.35);
          }

          .search-container {
            margin: 1.5rem 0;
            text-align: center;
          }

          .search-container input {
            width: 300px;
            max-width: 100%;
            padding: 0.75rem 1rem;
            font-size: 1rem;
            border: 1px solid #D1D5DB;
            border-radius: 9999px;
            outline: none;
            background: white;
            color: #111827;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .search-container input:focus {
            border-color:rgb(197, 247, 17);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          }

          .table-wrapper {
            max-height: 600px;
            overflow-y: auto;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            background: #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
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
            background: #F8C319;
            color: #111827;
            font-weight: 600;
            border-bottom: 2px solid rgb(249, 229, 46);
          }

          tbody tr {
            border-bottom: 1px solid #E5E7EB;
          }

          tbody tr:nth-child(even) {
            background: #F3F4F6;
          }

          tbody tr:hover {
            background: #E0E7FF;
          }
          .mobile-cta-strip {
            display: none;
          }

          @media (max-width: 768px) {
          .mobile-cta-strip {
            display: block;
          }

          .right-sidebar {
            display: none;
          }
          .header-section {
            margin-bottom: 1rem;
            margin-top: 1rem; /* Add this if missing */
          }

          .header-section h1 {
            font-size: 1.4rem;
            margin-bottom: 0.25rem;
          }

          .subtext {
            font-size: 0.9rem;
            margin-top: 0.25rem;
          }

          .main-wrapper {
            flex-direction: column;
            padding: 0 1rem;
          
          }

          .mobile-cta-strip {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background:#fff ;
            padding: 0.5rem 1rem;
            text-align: center;
            z-index: 999;
            border-top: 1px solid #e5e7eb;
          }

          .mobile-call-button {
            display: inline-block;
            font-size: 0.95rem;
            font-weight: 600;
            padding: 0.5rem 1.25rem;
            background: #F8C319;
            color: #111;
            border-radius: 9999px;
            text-decoration: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .table-wrapper {
            max-height: calc(100vh - 240px);
            overflow-y: auto;
            border-radius:8px;
            border: 1px solid #e5e7eb;
            margin-top: 0.25rem;

          }

          table {
            width: 100%;
            table-layout: fixed;
            font-size: 0.75rem;
            border-collapse: collapse;
          }

          th, td {
            padding: 0.5rem 0.6rem;
            font-size: 0.8rem;
            white-space: normal;
            word-break: break-word;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .search-container{
            margin: 0.5rem 0;
          }
         
          .search-container input {
            width: 80%;
            font-size: 0.9rem;
            
          }
        }



        `}</style>

    </div>
  );
  
}
