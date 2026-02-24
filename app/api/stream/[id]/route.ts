import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { idToPath } from "@/app/lib/scanner";

export const dynamic = "force-dynamic";

/**
 * Wrap a Node.js ReadStream in a Web ReadableStream with proper backpressure.
 * The node stream is paused immediately and only resumed when the ReadableStream
 * consumer calls pull(), preventing unbounded memory growth during long playback.
 */
function nodeToWebStream(
  nodeStream: fs.ReadStream,
): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>(
    {
      start(controller) {
        nodeStream.pause();

        nodeStream.on("data", (chunk: Buffer | string) => {
          nodeStream.pause();
          try {
            controller.enqueue(
              Buffer.isBuffer(chunk)
                ? new Uint8Array(chunk)
                : new TextEncoder().encode(chunk),
            );
          } catch {
            // Controller already closed (client disconnected).
            nodeStream.destroy();
          }
        });

        nodeStream.on("end", () => {
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        });

        nodeStream.on("error", (err) => {
          try {
            controller.error(err);
          } catch {
            /* already closed */
          }
        });
      },
      pull() {
        // Consumer is ready for more data — resume the node stream.
        nodeStream.resume();
      },
      cancel() {
        nodeStream.destroy();
      },
    },
    // Keep at most 2 chunks queued in the ReadableStream internal buffer.
    { highWaterMark: 2 },
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let filePath: string;
  try {
    filePath = idToPath(id);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  let stat: Awaited<ReturnType<typeof fsp.stat>>;
  try {
    stat = await fsp.stat(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const fileSize = stat.size;
  const rangeHeader = req.headers.get("range");

  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  const mimeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    flac: "audio/flac",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    opus: "audio/ogg",
    wma: "audio/x-ms-wma",
  };
  const contentType = mimeMap[ext] ?? "audio/mpeg";

  if (rangeHeader) {
    // Parse the Range header, supporting all three forms:
    //   bytes=<start>-<end>   e.g. bytes=0-1023
    //   bytes=<start>-        e.g. bytes=1024-  (to end of file)
    //   bytes=-<suffix>       e.g. bytes=-512   (last 512 bytes)
    const rangeMatch = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
    if (!rangeMatch) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    const [, rawStart, rawEnd] = rangeMatch;
    let start: number;
    let end: number;

    if (rawStart === "") {
      const suffixLen = parseInt(rawEnd, 10);
      if (isNaN(suffixLen) || suffixLen === 0) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileSize}` },
        });
      }
      start = Math.max(0, fileSize - suffixLen);
      end = fileSize - 1;
    } else {
      start = parseInt(rawStart, 10);
      end = rawEnd !== "" ? parseInt(rawEnd, 10) : fileSize - 1;
    }

    end = Math.min(end, fileSize - 1);
    if (isNaN(start) || isNaN(end) || start > end || start >= fileSize) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    const chunkSize = end - start + 1;

    // 256 KB read chunks — large enough for throughput, small enough for backpressure.
    const nodeStream = fs.createReadStream(filePath, {
      start,
      end,
      highWaterMark: 256 * 1024,
    });
    const webStream = nodeToWebStream(nodeStream);

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  }

  const nodeStream = fs.createReadStream(filePath, {
    highWaterMark: 256 * 1024,
  });
  const webStream = nodeToWebStream(nodeStream);

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
