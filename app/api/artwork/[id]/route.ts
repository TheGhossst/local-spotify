import { NextRequest, NextResponse } from "next/server";
import { idToPath } from "@/app/lib/scanner";
import { parseAudioFile } from "@/app/lib/metadata";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let filePath: string;
  try {
    filePath = idToPath(id);
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { artworkBuffer, artworkMime } = await parseAudioFile(filePath);
    if (!artworkBuffer) {
      return new NextResponse(null, { status: 404 });
    }
    return new NextResponse(new Uint8Array(artworkBuffer), {
      headers: {
        "Content-Type": artworkMime ?? "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
