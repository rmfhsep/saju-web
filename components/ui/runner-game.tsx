"use client"

import { useEffect, useRef, useState } from "react"

/**
 * 오리지널 엔드리스 러너 미니게임 (캔버스).
 * - 하단 '점프' 버튼(또는 스페이스)으로 점프해 장애물을 넘고, 시간이 지날수록 빨라진다.
 * - 충돌하면 게임 오버 → onGameOver(생존초)  호출. 별 지급 정책이 생존시간 구간 기준이라 점수는 초 단위로 집계한다.
 * - 최대 maxPlays판까지 플레이 가능.
 * 캐릭터/장애물/코드는 특정 저작물을 복제하지 않은 자체 구현이며, 캐릭터는 귀여운 로봇 모양이다.
 */
export default function RunnerGame({
  height = 220,
  maxPlays = 3,
  onGameOver,
  className,
}: {
  height?: number
  maxPlays?: number
  onGameOver?: (survivalSeconds: number) => void
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameOver, setGameOver] = useState(false)
  const [finalSeconds, setFinalSeconds] = useState(0)
  const [playsUsed, setPlaysUsed] = useState(0)

  const onGameOverRef = useRef(onGameOver)
  onGameOverRef.current = onGameOver
  const jumpRef = useRef<() => void>(() => {})
  const resetRef = useRef<() => void>(() => {})

  const exhausted = playsUsed >= maxPlays

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    let cssW = wrap.clientWidth || 320
    const cssH = height

    function resize() {
      cssW = wrap!.clientWidth || 320
      canvas!.width = Math.round(cssW * dpr)
      canvas!.height = Math.round(cssH * dpr)
      canvas!.style.width = `${cssW}px`
      canvas!.style.height = `${cssH}px`
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const groundY = cssH - 28
    const PLAYER_X = 44
    const PLAYER_SIZE = 34
    const GRAVITY = 0.9
    const JUMP_V = -14

    type Obstacle = { x: number; w: number; h: number }
    let playerY = groundY - PLAYER_SIZE
    let vy = 0
    let onGround = true
    let obstacles: Obstacle[] = []
    let distToNext = 320
    let speed = 5.2
    let startedAt = 0 // rAF 타임스탬프 기준 생존시간 측정 시작점
    let elapsedSec = 0
    let over = false
    let raf = 0
    let last = 0
    let bob = 0 // 달릴 때 살짝 위아래 흔들림

    function start() {
      playerY = groundY - PLAYER_SIZE
      vy = 0
      onGround = true
      obstacles = []
      distToNext = 320
      speed = 5.2
      startedAt = 0
      elapsedSec = 0
      over = false
      last = 0
      setGameOver(false)
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }
    resetRef.current = start

    function jump() {
      if (over) return
      if (onGround) { vy = JUMP_V; onGround = false }
    }
    jumpRef.current = jump

    // 귀여운 로봇 캐릭터
    function drawRobot(cx: number, cy: number, s: number) {
      const bw = s * 0.82
      const bh = s * 0.78
      const r = s * 0.26
      // 안테나
      ctx!.strokeStyle = "#5b8bef"
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.moveTo(cx, cy - bh / 2)
      ctx!.lineTo(cx, cy - bh / 2 - s * 0.2)
      ctx!.stroke()
      ctx!.fillStyle = "#FFB020"
      ctx!.beginPath()
      ctx!.arc(cx, cy - bh / 2 - s * 0.22, s * 0.1, 0, Math.PI * 2)
      ctx!.fill()
      // 몸통
      ctx!.fillStyle = "#6b9bff"
      ctx!.beginPath()
      if (typeof ctx!.roundRect === "function") ctx!.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, r)
      else ctx!.rect(cx - bw / 2, cy - bh / 2, bw, bh)
      ctx!.fill()
      // 얼굴 창(진한 파랑)
      ctx!.fillStyle = "#2f6be0"
      ctx!.beginPath()
      const fw = bw * 0.72, fh = bh * 0.5
      if (typeof ctx!.roundRect === "function") ctx!.roundRect(cx - fw / 2, cy - fh / 2 - s * 0.02, fw, fh, r * 0.6)
      else ctx!.rect(cx - fw / 2, cy - fh / 2, fw, fh)
      ctx!.fill()
      // 눈 (흰자 + 눈동자)
      const eyeDx = s * 0.16
      const eyeY = cy - s * 0.04
      ctx!.fillStyle = "#ffffff"
      for (const dx of [-eyeDx, eyeDx]) {
        ctx!.beginPath(); ctx!.arc(cx + dx, eyeY, s * 0.1, 0, Math.PI * 2); ctx!.fill()
      }
      ctx!.fillStyle = "#1f1f1f"
      for (const dx of [-eyeDx, eyeDx]) {
        ctx!.beginPath(); ctx!.arc(cx + dx, eyeY, s * 0.05, 0, Math.PI * 2); ctx!.fill()
      }
      // 미소
      ctx!.strokeStyle = "#ffffff"
      ctx!.lineWidth = 1.6
      ctx!.beginPath()
      ctx!.arc(cx, cy + s * 0.12, s * 0.11, 0.15 * Math.PI, 0.85 * Math.PI)
      ctx!.stroke()
      // 다리
      ctx!.fillStyle = "#5b8bef"
      const legY = cy + bh / 2
      for (const dx of [-bw * 0.24, bw * 0.24]) {
        ctx!.beginPath()
        if (typeof ctx!.roundRect === "function") ctx!.roundRect(cx + dx - s * 0.06, legY - 1, s * 0.12, s * 0.12, 2)
        else ctx!.rect(cx + dx - s * 0.06, legY - 1, s * 0.12, s * 0.12)
        ctx!.fill()
      }
    }

    function loop(t: number) {
      if (!last) last = t
      if (!startedAt) startedAt = t
      const dtf = Math.min((t - last) / 16.67, 2.5)
      last = t
      elapsedSec = (t - startedAt) / 1000

      speed += 0.0015 * dtf
      vy += GRAVITY * dtf
      playerY += vy * dtf
      if (playerY >= groundY - PLAYER_SIZE) {
        playerY = groundY - PLAYER_SIZE
        vy = 0
        onGround = true
      }
      bob += 0.3 * dtf

      distToNext -= speed * dtf
      if (distToNext <= 0) {
        const h = 22 + Math.random() * 26
        obstacles.push({ x: cssW + 10, w: 14 + Math.random() * 10, h })
        distToNext = 240 + Math.random() * 220 - Math.min(speed * 8, 90)
      }
      obstacles.forEach(o => { o.x -= speed * dtf })
      obstacles = obstacles.filter(o => o.x + o.w > -10)

      const pad = 6
      const px = PLAYER_X + pad
      const py = playerY + pad
      const ps = PLAYER_SIZE - pad * 2
      for (const o of obstacles) {
        if (px < o.x + o.w && px + ps > o.x && py + ps > groundY - o.h) { over = true; break }
      }

      ctx!.clearRect(0, 0, cssW, cssH)
      ctx!.strokeStyle = "#e0e0e0"
      ctx!.lineWidth = 2
      ctx!.beginPath(); ctx!.moveTo(0, groundY + 1); ctx!.lineTo(cssW, groundY + 1); ctx!.stroke()

      ctx!.fillStyle = "#1f1f1f"
      for (const o of obstacles) {
        ctx!.beginPath()
        if (typeof ctx!.roundRect === "function") ctx!.roundRect(o.x, groundY - o.h, o.w, o.h, 3)
        else ctx!.rect(o.x, groundY - o.h, o.w, o.h)
        ctx!.fill()
      }

      const bobY = onGround ? Math.sin(bob) * 1.5 : 0
      drawRobot(PLAYER_X + PLAYER_SIZE / 2, playerY + PLAYER_SIZE / 2 + bobY, PLAYER_SIZE)

      ctx!.fillStyle = "#949494"
      ctx!.font = "600 13px Pretendard, sans-serif"
      ctx!.textAlign = "right"
      ctx!.fillText(`${elapsedSec.toFixed(1)}s`, cssW - 6, 20)

      if (over) {
        setFinalSeconds(elapsedSec)
        setGameOver(true)
        setPlaysUsed(p => p + 1)
        onGameOverRef.current?.(elapsedSec)
        return
      }
      raf = requestAnimationFrame(loop)
    }

    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump() }
    }
    window.addEventListener("keydown", onKey)
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("keydown", onKey)
    }
  }, [height])

  function handleButton() {
    if (!gameOver) { jumpRef.current(); return }
    if (!exhausted) resetRef.current()
  }

  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <div ref={wrapRef} className="relative w-full select-none bg-white rounded-[12px] border border-[#eee] overflow-hidden" style={{ height }}>
        <canvas ref={canvasRef} className="block w-full touch-none" style={{ height }} />
        <p className="absolute top-1 left-2 text-[12px] text-[#b7b7b7] pointer-events-none">
          남은 기회 {Math.max(0, maxPlays - playsUsed)}/{maxPlays}
        </p>
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/70">
            <p className="text-[15px] font-semibold text-[#1f1f1f]">게임 오버 · {finalSeconds.toFixed(1)}초 생존</p>
            <p className="text-[13px] text-[#777]">
              {exhausted ? "3판 모두 사용했어요" : `남은 기회 ${maxPlays - playsUsed}/${maxPlays}`}
            </p>
          </div>
        )}
      </div>
      <button
        onClick={handleButton}
        disabled={gameOver && exhausted}
        className="w-full h-[52px] rounded-[10px] bg-[#1f1f1f] text-white text-[15px] font-semibold active:opacity-80 disabled:opacity-40"
      >
        {gameOver ? (exhausted ? "기회 소진" : "다시 하기") : "점프"}
      </button>
    </div>
  )
}
