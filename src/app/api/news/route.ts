import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

const parser = new Parser({
  customFields: {
    item: ['enclosure', 'media:content', 'description']
  }
});

export async function GET() {
  try {
    const feed = await parser.parseURL('https://www.motorsport.com/rss/f1/news/');
    
    const news = feed.items.slice(0, 10).map((item) => {
      // Extract image from enclosure or media:content if available
      let imageUrl = null;
      if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url;
      } else if (item['media:content'] && item['media:content'].$) {
        imageUrl = item['media:content'].$.url;
      }

      // Cleanup content snippet
      let snippet = item.contentSnippet || item.description || "";
      if (snippet.length > 120) {
        snippet = snippet.substring(0, 120) + "...";
      }

      return {
        id: item.guid || item.link,
        title: item.title,
        link: item.link,
        date: item.isoDate || item.pubDate,
        imageUrl: imageUrl,
        snippet: snippet,
        source: "Motorsport.com"
      };
    });

    return NextResponse.json({ news });
  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch F1 news' }, { status: 500 });
  }
}
