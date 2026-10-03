import { ImageResponse } from "next/og";
import { BrandIcon, brandIconFonts } from "./brand-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(<BrandIcon size={32} rounded />, { ...size, fonts: await brandIconFonts() });
}
