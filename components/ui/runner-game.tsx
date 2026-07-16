"use client"

import { useEffect, useRef, useState } from "react"

/**
 * 오리지널 엔드리스 러너 미니게임 (캔버스).
 * - 탭/스페이스로 점프해 장애물을 넘고, 시간이 지날수록 빨라진다.
 * - 충돌하면 게임 오버 → onGameOver(score) 호출.
 * 구글 크롬 게임의 에셋/코드를 복제하지 않은 자체 구현이며, 캐릭터는 앱 테마에 맞춘 별 모양이다.
 */
export default function RunnerGame({
  height = 220,
  onGameOver,
  className,
}: {
  height?: number
  onGameOver?: (score: number) => void
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameOver, setGameOver] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  // 게임 로직에서 접근할 콜백/상태를 ref로 고정
  const onGameOverRef = useRef(onGameOver)
  onGameOverRef.current = onGameOver
  const restartRef = useRef<() => void>(() => {})

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

    // ── 게임 상태 ──
    const groundY = cssH - 28
    const PLAYER_X = 44
    const PLAYER_SIZE = 30
    const GRAVITY = 0.9
    const JUMP_V = -14

    type Obstacle = { x: number; w: number; h: number }
    let playerY = groundY - PLAYER_SIZE
    let vy = 0
    let onGround = true
    let obstacles: Obstacle[] = []
    let distToNext = 320
    let speed = 5.2
    let score = 0
    let over = false
    let raf = 0
    let last = 0

    function reset() {
      playerY = groundY - PLAYER_SIZE
      vy = 0
      onGround = true
      obstacles = []
      distToNext = 320
      speed = 5.2
      score = 0
      over = false
      setGameOver(false)
      last = 0
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(loop)
    }
    restartRef.current = reset

    function jump() {
      if (over) { reset(); return }
      if (onGround) {
        vy = JUMP_V
        onGround = false
      }
    }

    // 별 모양 path
    function drawStar(cx: number, cy: number, r: number) {
      ctx!.beginPath()
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI / 5) * i - Math.PI / 2
        const rad = i % 2 === 0 ? r : r * 0.45
        const x = cx + Math.cos(ang) * rad
        const y = cy + Math.sin(ang) * rad
        if (i === 0) ctx!.moveTo(x, y)
        else ctx!.lineTo(x, y)
      }
      ctx!.closePath()
      ctx!.fill()
    }

    function loop(t: number) {
      if (!last) last = t
      const dtf = Math.min((t - last) / 16.67, 2.5)
      last = t

      // 업데이트
      speed += 0.0015 * dtf
      score += speed * dtf * 0.25
      vy += GRAVITY * dtf
      playerY += vy * dtf
      if (playerY >= groundY - PLAYER_SIZE) {
        playerY = groundY - PLAYER_SIZE
        vy = 0
        onGround = true
      }

      distToNext -= speed * dtf
      if (distToNext <= 0) {
        const h = 22 + Math.random() * 26
        obstacles.push({ x: cssW + 10, w: 14 + Math.random() * 10, h })
        distToNext = 240 + Math.random() * 220 - Math.min(speed * 8, 90)
      }
      obstacles.forEach(o => { o.x -= speed * dtf })
      obstacles = obstacles.filter(o => o.x + o.w > -10)

      // 충돌 (약간 관대하게 inset)
      const pad = 5
      const px = PLAYER_X + pad
      const py = playerY + pad
      const ps = PLAYER_SIZE - pad * 2
      for (const o of obstacles) {
        if (px < o.x + o.w && px + ps > o.x && py + ps > groundY - o.h) {
          over = true
          break
        }
      }

      // 그리기
      ctx!.clearRect(0, 0, cssW, cssH)
      // 지면
      ctx!.strokeStyle = "#e0e0e0"
      ctx!.lineWidth = 2
      ctx!.beginPath()
      ctx!.moveTo(0, groundY + 1)
      ctx!.lineTo(cssW, groundY + 1)
      ctx!.stroke()
      // 장애물
      ctx!.fillStyle = "#1f1f1f"
      for (const o of obstacles) {
        ctx!.beginPath()
        if (typeof ctx!.roundRect === "function") ctx!.roundRect(o.x, groundY - o.h, o.w, o.h, 3)
        else ctx!.rect(o.x, groundY - o.h, o.w, o.h)
        ctx!.fill()
      }
      // 별 플레이어
      ctx!.fillStyle = "#FFB020"
      drawStar(PLAYER_X + PLAYER_SIZE / 2, playerY + PLAYER_SIZE / 2, PLAYER_SIZE / 2)
      // 점수
      ctx!.fillStyle = "#949494"
      ctx!.font = "600 13px Pretendard, sans-serif"
      ctx!.textAlign = "right"
      ctx!.fillText(String(Math.floor(score)).padStart(5, "0"), cssW - 6, 20)

      if (over) {
        setFinalScore(Math.floor(score))
        setGameOver(true)
        onGameOverRef.current?.(Math.floor(score))
        return
      }
      raf = requestAnimationFrame(loop)
    }

    // 입력
    function onPointer() { jump() }
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump() }
    }
    canvas.addEventListener("pointerdown", onPointer)
    window.addEventListener("keydown", onKey)

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      canvas.removeEventListener("pointerdown", onPointer)
      window.removeEventListener("keydown", onKey)
    }
  }, [height])

  return (
    <div ref={wrapRef} className={`relative w-full select-none ${className ?? ""}`} style={{ height }}>
      <canvas ref={canvasRef} className="block w-full touch-none" style={{ height }} />
      {!gameOver ? (
        <p className="absolute top-1 left-2 text-[12px] text-[#b7b7b7] pointer-events-none">탭해서 점프</p>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70">
          <p className="text-[15px] font-semibold text-[#1f1f1f]">게임 오버 · {finalScore}점</p>
          <button
            onClick={() => restartRef.current()}
            className="h-[36px] px-4 bg-[#e9f1ff] rounded-[4px] text-[13px] font-medium text-[#1a75ff] active:opacity-80"
          >
            다시 하기
          </button>
        </div>
      )}
    </div>
  )
}
