// pages/api/notion.js
import { Client } from '@notionhq/client';

const notion     = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

/**
 * Pulls plain‐text out of either a title or rich_text property
 * and joins it into a single string (or returns '—' if empty).
 */
function extractText(prop) {
  if (!prop) return '—';
  const arr = prop.title ?? prop.rich_text ?? [];
  return arr
    .map(item => item.plain_text ?? item.text?.content ?? '')
    .join('')
    .trim() || '—';
}

export default async function handler(req, res) {
  // ─── CORS ───────────────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  // ────────────────────────────────────────────────────────────────────────────

  try {
    // 1) Fetch all pages via pagination
    let allPages = [];
    let cursor   = undefined;

    do {
      const { results, has_more, next_cursor } = await notion.databases.query({
        database_id: databaseId,
        start_cursor: cursor,
      });
      allPages.push(...results);
      cursor = has_more ? next_cursor : undefined;
    } while (cursor);

    // 2) Transform into only the fields you need
    const results = allPages.map(page => {
      const p = page.properties;
      return {
        title:   extractText(p.Name),
        company: extractText(p.Company),
        date:    extractText(p.Date),
        url:     page.url ?? '#',
      };
    });

    // 3) Return as JSON
    res.status(200).json({ results });
  } catch (error) {
    console.error('❌ Notion API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
