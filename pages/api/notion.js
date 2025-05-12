// pages/api/notion.js

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  // ─── CORS SETUP ───────────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    // Preflight request. Respond with no content.
    return res.status(204).end();
  }
  // ─────────────────────────────────────────────────────────────────────────────

  try {
    // Query your Notion database
    const response = await notion.databases.query({ database_id: databaseId });

    // Flatten the results to only the fields you need
    const results = response.results.map(page => {
      const props = page.properties;
      return {
        title:   props.Name?.title?.[0]?.plain_text        || '—',
        company: props.Company?.rich_text?.[0]?.plain_text || '—',
        date:    props.Date?.rich_text?.[0]?.plain_text    || '—',
        url:     page.url || '#'
      };
    });

    // Return as JSON
    res.status(200).json({ results });
  } catch (error) {
    console.error('Notion API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
