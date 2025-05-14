// pages/api/notion/top10.js
import { Client } from '@notionhq/client';

const notion     = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

/** same helpers you already have… */
function extractText(prop) {
  if (!prop) return '—';
  const arr = prop.title ?? prop.rich_text ?? [];
  const txt = arr.map(i => i.plain_text ?? i.text?.content ?? '').join('').trim();
  return txt || '—';
}
function extractCompanyFromUrl(rawUrl) {
  try {
    let m = rawUrl.match(/linkedin\.com\/company\/([^\/?#]+)/i);
    if (m) return decodeURIComponent(m[1]);
    m = rawUrl.match(/indeed\.com\/cmp\/([^\/?#]+)/i);
    if (m) return decodeURIComponent(m[1]);
    return new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {
    return rawUrl;
  }
}
function getCompanyName(prop) {
  if (!prop) return '—';
  if (prop.type === 'url') return extractCompanyFromUrl(prop.url);
  const txt = extractText(prop);
  return /^https?:\/\//.test(txt) ? extractCompanyFromUrl(txt) : txt;
}

export default async function handler(req, res) {
  // ─── CORS ─────────────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  // ────────────────────────────────────────────────────────────────────────────

  try {
    // Query only 10, sorted by your Date property descending
    const { results } = await notion.databases.query({
      database_id: databaseId,
      page_size: 10,
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    // Format & filter out any “—” rows if you like
    const formatted = results.map(page => {
        const p = page.properties;
        return {
          title: Array.isArray(p["Job Title"]?.title)
                              ? p["Job Title"].title.map(t => t.plain_text).join('').trim()
                              : '—',
          company: p["Company"]?.rich_text?.[0]?.plain_text || '—',
          date: p["Date"]?.date?.start
                    ? new Date(p["Date"].date.start).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short', // or 'long' for full month name
                        year: 'numeric',
                      })
                    : '—',
          url:     page.url || '#',
        };
      });
      
      const filtered = formatted.filter(
        r =>
          r.title &&
          r.title.trim() !== '' &&
          r.company &&
          r.company.trim() !== '' &&
          r.date &&
          r.date.trim() !== ''
      );
      
    res.status(200).json({ results: formatted });
  } catch (err) {
    console.error('Top10 API Error:', err);
    res.status(500).json({ error: err.message });
  }
}
