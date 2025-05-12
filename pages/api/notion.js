// pages/api/notion.js

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export default async function handler(req, res) {
  try {
    // fetch the raw database query
    const response = await notion.databases.query({ database_id: databaseId });

    console.log("Raw Notion response:", JSON.stringify(response, null, 2));

    // transform into only what your UI needs
    const results = response.results.map(page => {
      const props = page.properties;

      return {
        title:   props.Name?.title?.[0]?.plain_text     || '—',
        company: props.Company?.rich_text?.[0]?.plain_text || '—',
        date:    props.Date?.rich_text?.[0]?.plain_text    || '—',
        url:     page.url || null
      };
    });

    // return as { results: [...] } so your frontend code can do json.results
    res.status(200).json({ results });
  } catch (error) {
    console.error("❌ Notion API Error:", error);
    res.status(500).json({ error: error.message });
  }
}
