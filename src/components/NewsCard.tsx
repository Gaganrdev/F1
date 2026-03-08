"use client";

import { useEffect, useState } from "react";
import { Newspaper, ExternalLink } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  date: string;
  imageUrl: string | null;
  snippet: string;
  source: string;
}

export default function NewsCard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchNews = async () => {
      try {
        const response = await fetch("/api/news");
        if (!response.ok) throw new Error("Failed to load news");
        const data = await response.json();

        if (mounted) {
          setNews(data.news || []);
          setError(null);
        }
      } catch (err) {
        const error = err as any;
        if (mounted) setError(error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNews();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/10 dark:border-white/5 shadow-xl h-[400px] flex items-center justify-center">
        <p className="text-red-400">Error loading news: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 dark:border-white/5 shadow-xl flex flex-col h-[400px] overflow-hidden">
      <div className="p-5 border-b border-white/10 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-red-500" />
          Latest F1 News
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-4 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 w-full">
                <div className="w-20 h-20 bg-white/10 rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-white/10 rounded w-full"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/4 mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No news at the moment.
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-2">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors duration-200"
              >
                {item.imageUrl && (
                  <div className="w-20 h-20 shrink-0 overflow-hidden rounded-lg border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {item.snippet}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2 max-w-full">
                    <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
