import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "연애 사주",
  description: "별자리가 말해주는 당신의 연애운",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        className="min-h-screen flex justify-center"
        style={{ background: "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #1a0533 70%, #0f0c29 100%)" }}
      >
        {/* 배경 오브 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
          <div className="absolute top-[30%] right-[-15%] w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #06b6d4, transparent 70%)" }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, #ec4899, transparent 70%)" }} />
        </div>

        <div className="relative w-full max-w-[390px] min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
