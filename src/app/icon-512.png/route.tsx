import { ImageResponse } from "next/og";
import { BrandIcon } from "../brand-icon";

export async function GET() {
  return new ImageResponse(<BrandIcon size={512} />, { width: 512, height: 512 });
}
