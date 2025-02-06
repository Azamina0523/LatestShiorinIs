import { Parser } from "htmlparser2";

// YouTubeのRSSフィードURL
const rssUrl = "https://www.youtube.com/feeds/videos.xml?channel_id=UCgnfPPb9JI3e9A4cXHnWbyg";

// YouTube RSS フィードを取得してパースする関数
async function getYoutubeRSS(): Promise<{ title: string; link: string; published: string } | null> {
  try {
    const response = await fetch(rssUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }
    const xmlData = await response.text();

    let currentTag = "";
    let currentTitle = "";
    let currentLink = "";
    let currentPublished = "";
    let firstEntry: { title: string; link: string; published: string } | null = null;
    let foundFirstEntry = false; // 最初のentryを検出したかどうか

    const parser = new Parser(
      {
        onopentag(name, attribs) {
          currentTag = name;
          if (name === "link" && attribs.href) {
            currentLink = attribs.href;
          }
        },
        ontext(text) {
          if (currentTag === "title") {
            currentTitle = text.trim();
          } else if (currentTag === "published") {
            currentPublished = text.trim();
          }
        },
        onclosetag(name) {
          if (name === "entry" && !foundFirstEntry) {
            if (currentTitle && currentLink && currentPublished) {
              firstEntry = {
                title: currentTitle,
                link: currentLink,
                published: currentPublished,
              };
              foundFirstEntry = true;
              parser.end(); // 最初のエントリー取得後に解析を終了
            }
            currentTitle = "";
            currentLink = "";
            currentPublished = "";
          }
          currentTag = "";
        },
      },
      { decodeEntities: true }
    );

    parser.write(xmlData);
    parser.end();

    console.log("First YouTube RSS Entry:", firstEntry);
    return firstEntry;
  } catch (error) {
    console.error("Error fetching YouTube RSS feed:", error);
    return null;
  }
}

interface VideoEntry {
  title: string;
  link: string;
  published: string;
}

export const onRequestPost = async (): Promise<Response> => {
  // getYoutubeRSSを呼び出してRSSの処理を実行
  const firstEntry: VideoEntry | null = await getYoutubeRSS();

  // firstEntryがnullでない場合のみ処理
  const videoTitle = firstEntry?.title || "No title available";
  const videoLink = firstEntry?.link || "No link available";
  const videoPublished = firstEntry?.published || "No published date available";

  // output をカンマ区切りの文字列にする
  const output = `"${videoTitle}","${videoLink}","${videoPublished}"`;

  // 結果をレスポンスとして返す
  return new Response(
    JSON.stringify({ output }), // output をそのまま JSON に格納
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};