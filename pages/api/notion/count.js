// pages/api/notion/count.js
import { Client } from '@notionhq/client';

const notion     = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

// Paginates through all pages server-side and tallies the total count
async function getTotalCount() {
  let cursor = undefined;
  let total  = 0;

  do {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    });
    total += results.length;
    cursor = next_cursor;
  } while (cursor);

  return total;
}

export default async function handler(req, res) {
  // Allow CORS from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const count = await getTotalCount();
    res.status(200).json({ count });
  } catch (error) {
    // console.error('Count API Error:', error);
    res.status(500).json({ error: error.message });
  }
}
