'use client'

import React, { useMemo, useState } from 'react'

interface UpiQrCodeProps {
  upiId?: string
  payeeName?: string
  amount: number
  tokenRef: string
  size?: number
  customQrImageUrl?: string
  useCustomImage?: boolean
}

// Generates a deterministic pseudo-QR code SVG pattern based on the payload string,
// or renders a custom admin-uploaded/configured merchant QR image
export function UpiQrCode({
  upiId = 'canteen.campus@icici',
  payeeName = 'Campus Canteen',
  amount,
  tokenRef,
  size = 220,
  customQrImageUrl,
  useCustomImage = false,
}: UpiQrCodeProps) {
  const [imageError, setImageError] = useState(false)
  const upiPayload = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Token ' + tokenRef)}`

  // Generate a realistic 29x29 QR matrix with real finder patterns and pseudo-random data hashes
  const matrix = useMemo(() => {
    const N = 29
    const grid: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false))

    // Helper: draw finder pattern at (r, c)
    function drawFinder(r: number, c: number) {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (
            i === 0 || i === 6 || j === 0 || j === 6 ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            grid[r + i][c + j] = true
          }
        }
      }
    }

    // Three corner finders
    drawFinder(0, 0)
    drawFinder(0, N - 7)
    drawFinder(N - 7, 0)

    // Alignment pattern near bottom right
    const ar = 20, ac = 20
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        if (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0)) {
          grid[ar + i][ac + j] = true
        }
      }
    }

    // Timing lines
    for (let i = 8; i < N - 8; i++) {
      grid[6][i] = i % 2 === 0
      grid[i][6] = i % 2 === 0
    }

    // Simple deterministic hash based on payload for data cells
    let hash = 0
    for (let i = 0; i < upiPayload.length; i++) {
      hash = (hash * 31 + upiPayload.charCodeAt(i)) >>> 0
    }

    // Seeded pseudo random
    let state = hash
    function nextBit() {
      state = (state * 1664525 + 1013904223) >>> 0
      return (state & 1) === 1
    }

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        // Skip finders & separators
        const inTopLeft = r < 8 && c < 8
        const inTopRight = r < 8 && c >= N - 8
        const inBottomLeft = r >= N - 8 && c < 8
        const inAlignment = r >= 18 && r <= 22 && c >= 18 && c <= 22
        const inTiming = (r === 6 && c >= 8 && c < N - 8) || (c === 6 && r >= 8 && r < N - 8)
        // Leave center 7x7 for UPI logo
        const inCenterLogo = r >= 11 && r <= 17 && c >= 11 && c <= 17

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inAlignment && !inTiming && !inCenterLogo) {
          grid[r][c] = nextBit()
        }
      }
    }

    return grid
  }, [upiPayload])

  const N = matrix.length
  const cellSize = 100 / N

  const renderCustomQrImage = Boolean(useCustomImage && customQrImageUrl && !imageError)

  return (
    <div className="relative flex flex-col items-center">
      <div 
        className="relative overflow-hidden rounded-2xl border-4 border-white bg-white p-3 shadow-md"
        style={{ width: size, height: size }}
      >
        {renderCustomQrImage ? (
          <div className="relative h-full w-full flex items-center justify-center bg-white">
            <img
              src={customQrImageUrl}
              alt="Merchant UPI QR Code"
              className="h-full w-full object-contain"
              onError={() => setImageError(true)}
            />
            <div className="absolute bottom-1 right-1 rounded bg-[#5e2786] px-1.5 py-0.5 text-[8px] font-black text-white shadow">
              UPI
            </div>
          </div>
        ) : (
          <>
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full shape-rendering-crispEdges"
            >
              <rect width="100" height="100" fill="#ffffff" />
              {matrix.map((row, r) =>
                row.map((filled, c) => {
                  if (!filled) return null
                  // Don't render cells inside center logo cutout
                  if (r >= 11 && r <= 17 && c >= 11 && c <= 17) return null
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={c * cellSize}
                      y={r * cellSize}
                      width={cellSize + 0.1}
                      height={cellSize + 0.1}
                      fill="#1a1c18"
                    />
                  )
                })
              )}
            </svg>

            {/* Center UPI / RuPay badge */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-white bg-[#5e2786] shadow-sm">
                <span className="font-extrabold text-[10px] tracking-tight text-white">UPI</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-2.5 flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[11px] font-semibold text-[#66685f]">
            Scan with Any UPI App · <strong className="text-[#23251f]">₹{amount.toFixed(2)}</strong>
          </p>
        </div>
        <p className="text-[10px] font-mono text-[#8b8d83]">
          VPA: <strong className="text-[#23251f]">{upiId}</strong> ({payeeName})
        </p>
      </div>
    </div>
  )
}
