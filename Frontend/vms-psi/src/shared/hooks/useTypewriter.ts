// src/features/auth/hooks/useTypewriter.ts

import { useEffect, useRef } from "react"

/**
 * useTypewriter
 * ------------------------------------------------------
 * Cycles through a list of words with a type/delete effect,
 * writing directly to a DOM node via ref — NOT via useState.
 *
 * Why this matters for performance:
 * If we used useState for each character, React would re-render
 * the ENTIRE component on every keystroke of the animation
 * (every ~50ms). With hundreds of characters typed over a
 * session, that's a lot of wasted render cycles for a tiny
 * visual detail. Writing to `textContent` directly bypasses
 * React's render cycle completely — the rest of the page
 * (form, validation state, etc.) is never touched by this.
 * ------------------------------------------------------
 */
export function useTypewriter(words: string[], typeSpeed = 70, deleteSpeed = 40, pauseMs = 1400) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || words.length === 0) return

    // Respect reduced-motion users — just show the first word statically
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      el.textContent = words[0]
      return
    }

    let wordIndex = 0
    let charIndex = 0
    let deleting = false
    let timeoutId: ReturnType<typeof setTimeout>

    function tick() {
      const current = words[wordIndex]

      if (!deleting) {
        charIndex++
        el!.textContent = current.slice(0, charIndex)
        if (charIndex === current.length) {
          deleting = true
          timeoutId = setTimeout(tick, pauseMs)
          return
        }
      } else {
        charIndex--
        el!.textContent = current.slice(0, charIndex)
        if (charIndex === 0) {
          deleting = false
          wordIndex = (wordIndex + 1) % words.length
        }
      }

      timeoutId = setTimeout(tick, deleting ? deleteSpeed : typeSpeed)
    }

    timeoutId = setTimeout(tick, 1000)

    // Cleanup: critical — without this, the timeout chain keeps running
    // even after the component unmounts, causing a memory leak / error
    // trying to write to a detached DOM node.
    return () => clearTimeout(timeoutId)
  }, [words, typeSpeed, deleteSpeed, pauseMs])

  return ref
}
