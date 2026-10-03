import { ImageResponse } from "next/og";
import { BrandIcon, brandIconFonts } from "../brand-icon";

export async function GET() {
  return new ImageResponse(<BrandIcon size={192} />, {
    width: 192,
    height: 192,
    fonts: await brandIconFonts(),
  });
}
