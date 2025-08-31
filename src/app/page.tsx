"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState<string[]>([]);
  const [interval, setInterval] = useState(1000); // 送信間隔の状態
  const [isConnected, setIsConnected] = useState(true); // 接続状態を管理

  useEffect(() => {
    // 接続中でなければ何もしない
    if (!isConnected) {
      return;
    }

    // クエリパラメータで間隔を指定して/api/sseエンドポイントに接続
    const eventSource = new EventSource(`/api/sse?interval=${interval}`);

    // メッセージ受信時の処理
    eventSource.onmessage = (event) => {
      const newMessage = event.data;
      setMessage(newMessage); // 最新のメッセージを更新
      setAllMessages((prevMessages) => [newMessage, ...prevMessages]); // メッセージ履歴の先頭に追加
    };

    // エラー発生時の処理
    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    // コンポーネントがアンマウントされるとき、または依存配列の値が変更される前に接続を閉じる
    return () => {
      eventSource.close();
    };
  }, [interval, isConnected]); // intervalまたはisConnectedが変更されたらeffectを再実行

  return (
    <main className="flex min-h-screen flex-col items-center p-12 sm:p-24 font-sans">
      <div className="z-10 w-full max-w-2xl items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center">
          Server-Sent Events Demo
        </h1>
        <div className="bg-neutral-100 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-inner w-full flex flex-col gap-4">
          <div>
            <label htmlFor="interval-slider" className="text-lg">
              Update Interval: <span className="font-bold">{interval}ms</span>
            </label>
            <input
              id="interval-slider"
              type="range"
              min="100"
              max="2000"
              step="100"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsConnected(true)}
              disabled={isConnected}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-green-500 disabled:bg-neutral-400 disabled:cursor-not-allowed"
            >
              Resume
            </button>
            <button
              onClick={() => setIsConnected(false)}
              disabled={!isConnected}
              className="w-full rounded-md bg-red-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-red-500 disabled:bg-neutral-400 disabled:cursor-not-allowed"
            >
              Stop
            </button>
          </div>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-inner w-full">
          <h2 className="text-xl sm:text-2xl mb-4">Latest Message:</h2>
          <p className="text-base sm:text-lg p-4 bg-white dark:bg-neutral-700 rounded min-h-[3rem] flex items-center">
            {message || "Waiting for messages..."}
          </p>
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg shadow-inner w-full">
          <h2 className="text-xl sm:text-2xl mb-4">Message History:</h2>
          <ul className="list-none h-64 overflow-y-auto p-4 bg-white dark:bg-neutral-700 rounded space-y-2">
            {allMessages.map((msg, index) => (
              <li
                key={index}
                className="text-sm animate-in fade-in-5 slide-in-from-top-2 duration-300"
              >
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
