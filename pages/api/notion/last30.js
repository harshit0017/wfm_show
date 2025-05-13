import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    let results = [];
    let hasMore = true;
    let startCursor = undefined;

    // Fetch all pages using pagination
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        start_cursor: startCursor,
        page_size: 100,
      });

      results = results.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    const now = new Date();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const recent = results.filter(page => {
      const dateStr = page.properties?.Date?.date?.start;
      if (!dateStr) return false;

      const interviewDate = new Date(dateStr);
      return now - interviewDate <= THIRTY_DAYS_MS;
    });

    res.status(200).json({ count: recent.length });
  } catch (error) {
    console.error('Error fetching last 30 day interviews:', error);
    res.status(500).json({ error: 'Failed to fetch data from Notion' });
  }
}
