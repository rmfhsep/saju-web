import type { Metadata, Viewport } from "next"
import "./globals.css"
import TabBarController from "@/components/ui/tabbar-controller"
import PushTokenListener from "@/components/ui/push-token-listener"

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
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* 폰트 CSS가 렌더 블로킹이라, 커넥션이라도 먼저 열어두면 새 WebView가 뜰 때마다
            생기는 DNS/TLS 왕복을 다른 리소스 로딩과 겹쳐서 줄일 수 있다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var root = document.documentElement;
            function update() {
              var vv = window.visualViewport;
              var h = vv ? Math.round(vv.height) : window.innerHeight;
              var kh = Math.max(0, window.innerHeight - h);
              root.style.setProperty('--app-height', h + 'px');
              root.style.setProperty('--keyboard-height', kh + 'px');
            }
            update();
            if (window.visualViewport) {
              window.visualViewport.addEventListener('resize', update);
              window.visualViewport.addEventListener('scroll', update);
            }
            window.addEventListener('resize', update);

            // 인풋 포커스 시 화면 안으로 스크롤
            document.addEventListener('focusin', function(e) {
              var el = e.target;
              if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
                setTimeout(function() {
                  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }, 380);
              }
            });
          })();
        `}} />
      </head>
      <body
        className="flex justify-center overflow-hidden"
        style={{ background: "white", height: "var(--app-height, 100dvh)" }}
      >
        {/* 배경 오브 */}


        <TabBarController />
        <PushTokenListener />
        <div className="relative w-full max-w-[768px]" style={{ height: "var(--app-height, 100dvh)" }}>
          {children}
        </div>
      </body>
    </html>
  )
}
