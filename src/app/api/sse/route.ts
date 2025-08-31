import { NextRequest, NextResponse } from "next/server";

// Vercelなどのエッジ環境でストリーミングを正しく動作させるための設定
export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const intervalParam = searchParams.get("interval");

  // デフォルトの間隔を1000msに設定
  let interval = 1000;
  if (intervalParam) {
    const parsedInterval = parseInt(intervalParam, 10);
    // パラメータが数値で、かつ妥当な範囲内（例: 100ms - 5000ms）であるか検証
    if (
      !isNaN(parsedInterval) &&
      parsedInterval >= 100 &&
      parsedInterval <= 5000
    ) {
      interval = parsedInterval;
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      let count = 0;
      const intervalId = setInterval(() => {
        // SSEのデータ形式は "data: <message>\n\n"
        const message = `data: Message #${++count} at ${new Date().toLocaleTimeString()}\n\n`;
        controller.enqueue(new TextEncoder().encode(message));
      }, interval); // ユーザーが指定した間隔を使用

      // クライアントが接続を閉じたときにインターバルを停止
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
