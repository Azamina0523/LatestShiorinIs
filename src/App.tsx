import { useState, useEffect } from "react";
import "./App.css"; // 外部CSSファイルをインポート

interface Data {
  output: string;
}

function App() {
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoLink, setVideoLink] = useState<string>("");
  const [publishedDate, setPublishedDate] = useState<string>("");
  const [timeElapsed, setTimeElapsed] = useState<string>("");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await fetch("/mainfunc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data: Data = await response.json();

        console.log("Received data:", data); // レスポンスデータを確認

        const [title, link, published] = data.output.split('","').map((str) => str.replace(/"/g, ""));
        setVideoTitle(title);
        setVideoLink(link);
        setPublishedDate(published);
      } catch (error) {
        console.error("Error fetching video data:", error);
      }
    };

    fetchVideoData();
  }, []);

  const extractVideoId = (url: string) => url.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1] || "";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // ISO 8601形式の日付をDateオブジェクトに変換
    return date.toLocaleString(); // ローカルタイムゾーンでフォーマット
  };

  // 経過時間を計算して表示する関数
  const calculateTimeElapsed = (dateString: string) => {
    const publishedDate = new Date(dateString); // ISO 8601形式の日付をDateオブジェクトに変換
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - publishedDate.getTime();
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const timeString = `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s ago`;
      setTimeElapsed(timeString);
    }, 1000);

    return () => clearInterval(interval); // コンポーネントがアンマウントされたときにintervalをクリア
  };

  useEffect(() => {
    if (publishedDate) {
      calculateTimeElapsed(publishedDate);
    }
  }, [publishedDate]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Latest Shiorin is</h1>
      </header>

      <section className="content">
        <div className="video-player">
          {videoLink && (
            <iframe
              width="1024"
              height="576"
              src={`https://www.youtube.com/embed/${extractVideoId(videoLink)}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        <div className="video-info">
          <p>Latest Shiorin : <a className="bold-info">{videoTitle ? videoTitle : "Title not available"}</a></p>
          <p>Published On : <a className="bold-info">{publishedDate ? formatDate(publishedDate) : "No date available"}</a></p>
          <p>Time Elapsed : <a className="bold-info">{timeElapsed || "Loading time..."}</a></p>
        </div>

        <div className="sample-content">
          <p>Who is Shiori Novella?  Check it out <a href="https://hololive.hololivepro.com/en/talents/shiori-novella/" target="_blank" className="white-link">here</a>!</p>
          <p><a href="https://www.youtube.com/@ShioriNovella" target="_blank" className="white-link">Shiori Novella Ch. hololive-EN</a></p>
        </div>
      </section>
    </div>
  );
}

export default App;