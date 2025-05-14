// pages/api/notion.js
import { Client } from '@notionhq/client';

const notion     = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

/** Extracts plain‐text from title or rich_text arrays. */
function extractText(prop) {
  if (!prop) return '—';
  const arr = prop.title ?? prop.rich_text ?? [];
  const text = arr
    .map(item => item.plain_text ?? item.text?.content ?? '')
    .join('')
    .trim();
  return text || '—';
}

/**
 * Given a URL string, pull out the company slug from known patterns:
 *  • linkedin.com/company/SLUG
 *  • indeed.com/cmp/SLUG
 * Falls back to hostname if no pattern matches.
 */
function extractCompanyFromUrl(rawUrl) {
  try {
    // LinkedIn pattern
    let m = rawUrl.match(/linkedin\.com\/company\/([^\/?#]+)/i);
    if (m) return decodeURIComponent(m[1]);

    // Indeed pattern
    m = rawUrl.match(/indeed\.com\/cmp\/([^\/?#]+)/i);
    if (m) return decodeURIComponent(m[1]);

    // Otherwise just return the hostname
    const { hostname } = new URL(rawUrl);
    return hostname.replace(/^www\./, '');
  } catch {
    return rawUrl;
  }
}

/**
 * Normalize whatever Notion gives you in the Company property:
 * 1) If it's a URL property, extract company via extractCompanyFromUrl
 * 2) If it's rich_text, get the text; if that text looks like a URL, extract from it
 * 3) Otherwise just return the text
 */
function getCompanyName(prop) {
  if (!prop) return '—';

  // 1) real URL property
  if (prop.type === 'url' && typeof prop.url === 'string') {
    return extractCompanyFromUrl(prop.url);
  }

  // 2) rich_text property
  if (prop.type === 'rich_text' && Array.isArray(prop.rich_text)) {
    const text = extractText(prop);
    // if the text itself is a URL, pull slug out
    if (/^https?:\/\//i.test(text)) {
      return extractCompanyFromUrl(text);
    }
    return text;
  }

  // 3) any other text‐based property
  return extractText(prop);
}

export default async function handler(req, res) {
  // ─── CORS ──────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  // ──────────────────────────────────────────────────────────────────

  try {
    const cursor = req.query.cursor || undefined;
    const { results, has_more: hasMore, next_cursor: nextCursor } =
      await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
        page_size: 100,
      });
    
    console.log('✅ Raw Notion Response:', JSON.stringify(results, null, 2));


    // const formatted = results.map(page => {
    //   const p = page.properties;
    //   return {
    //     title: extractText(p["Job Title"] ?? p.Name),
    //     company: getCompanyName(p.Company),
    //     date:    extractText(p.Date),
    //     url:     page.url ?? '#',
    //   };
    // });
    // // 2) Filter out any “empty” rows where title, company or date is just “—”
    // const filtered = formatted.filter(
    //   r => r.title !== '—' && r.company !== '—' && r.date !== '—'
    // );
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
    
    
    // 3) Send back only the good rows
    return res.status(200).json({
      results:   filtered,
      hasMore,
      nextCursor,
    });

  } catch (error) {
    console.error('❌ Notion API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
