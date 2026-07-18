'use client'

import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Check, Copy, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { MarkdownRenderer } from '@/shared/markdown/MarkdownRenderer'
// (no glassmorphism imports needed)
import type { SubChallengeMode, SubChallengeQuestion } from '../../types'

type SubChallengePanelProps = {
  challengeId: string
  loaded: boolean
  loading: boolean
  submitting: boolean
  mode: SubChallengeMode
  questions: SubChallengeQuestion[]
  nextQuestion: SubChallengeQuestion | null
  answers: Record<string, string>
  results: Record<string, boolean>
  completed: boolean
  flag: string | null
  message: string | null
  onAnswerChange: (orderNumber: number, value: string) => void
  onSubmit: (orderNumber?: number) => void | Promise<unknown>
  onReset: () => void | Promise<unknown>
}

function normalizeQuestionMarkdown(value: string) {
  const trimmed = String(value ?? '').trim()
  const wrappedInQuotes =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.charCodeAt(0) === 0x201c && trimmed.charCodeAt(trimmed.length - 1) === 0x201d) ||
    (trimmed.startsWith('\u00e2\u20ac\u0153') && trimmed.endsWith('\u00e2\u20ac\u009d'))

  return wrappedInQuotes ? trimmed.slice(1, -1).trim() : trimmed
}

const QuestionMarkdown = memo(function QuestionMarkdown({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = content.split('\n').length > 3 || content.length > 120

  if (!isLong) {
    return <MarkdownRenderer content={content} variant="compact" className="max-w-full break-words" />
  }

  return (
    <div className="relative">
      <div
        className={`max-w-full select-text break-words transition-all duration-300 relative ${isExpanded ? 'max-h-[none]' : 'max-h-[70px] overflow-hidden'
          }`}
      >
        <MarkdownRenderer content={content} variant="compact" className="max-w-full break-words" />
      </div>
      <div className="flex justify-start mt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-bold tracking-wide uppercase text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 py-0.5"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Read more <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
})

type ScrollAnchorSnapshot = {
  element: HTMLElement
  selector?: string
  top: number
  scrollParent: HTMLElement | null
  scrollTop: number
  windowScroll: { x: number; y: number }
}

function getScrollParent(element: HTMLElement) {
  let parent = element.parentElement

  while (parent) {
    const style = window.getComputedStyle(parent)
    const canScroll = ['auto', 'scroll', 'overlay'].includes(style.overflowY)

    if (canScroll && parent.scrollHeight > parent.clientHeight) return parent
    parent = parent.parentElement
  }

  return null
}

function captureScrollAnchor(element: HTMLElement | null, selector?: string): ScrollAnchorSnapshot | null {
  if (!element) return null
  const scrollParent = getScrollParent(element)

  return {
    element,
    selector,
    top: element.getBoundingClientRect().top,
    scrollParent,
    scrollTop: scrollParent?.scrollTop ?? window.scrollY,
    windowScroll: { x: window.scrollX, y: window.scrollY },
  }
}

function restoreScrollAnchor(snapshot: ScrollAnchorSnapshot | null) {
  if (!snapshot) return

  const restore = () => {
    // Only restore scroll parent (dialog content area), not window scroll
    // since Radix Dialog locks body scroll while open

    const nextElement = snapshot.selector
      ? document.querySelector<HTMLElement>(snapshot.selector)
      : null
    const element = nextElement || (snapshot.element.isConnected ? snapshot.element : null)

    if (!element) {
      if (snapshot.scrollParent) {
        snapshot.scrollParent.scrollTo({ top: snapshot.scrollTop, behavior: 'auto' })
      }
      return
    }

    const delta = element.getBoundingClientRect().top - snapshot.top

    if (Math.abs(delta) < 1) return

    if (snapshot.scrollParent) {
      snapshot.scrollParent.scrollTo({
        top: snapshot.scrollParent.scrollTop + delta,
        behavior: 'auto',
      })
    }
  }

  restore()
  requestAnimationFrame(() => {
    restore()
    requestAnimationFrame(restore)
  })
  window.setTimeout(restore, 50)
  window.setTimeout(restore, 150)
  window.setTimeout(restore, 300)
}

type QuestionCardProps = {
  cardAnchorId: string
  question: SubChallengeQuestion
  answer: string
  result?: boolean
  submitting: boolean
  completed: boolean
  current?: boolean
  onAnswerChange: (value: string) => void
  onSubmit: () => void | Promise<unknown>
  onSubmitScrollAnchorCapture?: (snapshot: ScrollAnchorSnapshot | null) => void
  onSubmitScrollAnchorClear?: (snapshot: ScrollAnchorSnapshot | null) => void
}

function QuestionCard({
  cardAnchorId,
  question,
  answer,
  result,
  submitting,
  completed,
  current = false,
  onAnswerChange,
  onSubmit,
  onSubmitScrollAnchorCapture,
  onSubmitScrollAnchorClear,
}: QuestionCardProps) {
  const [isChanged, setIsChanged] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const submitScrollAnchorRef = useRef<ScrollAnchorSnapshot | null>(null)
  const questionContent = normalizeQuestionMarkdown(question.question)
  const cardAnchorSelector = `[data-sub-question-card-id="${cardAnchorId}"]`

  const cardClassName = `group flex min-h-[74px] flex-col gap-2 px-3 py-2.5 rounded-xl border transition-all duration-200 ${completed
    ? 'border-emerald-500/20 bg-emerald-500/5 dark:border-emerald-500/10 dark:bg-emerald-500/5 opacity-90'
    : current
      ? 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/40 dark:border-blue-500/20 dark:bg-blue-500/5 hover:shadow-[0_4px_20px_rgba(59,130,246,0.05)]'
      : 'border-gray-200/50 bg-gray-50/30 hover:border-indigo-500/30 dark:border-gray-800/60 dark:bg-[#0e1320]/30 hover:shadow-[0_4px_20px_rgba(99,102,241,0.05)]'
    }`

  const prepareSubmitScrollRestore = useCallback(() => {
    submitScrollAnchorRef.current = captureScrollAnchor(cardRef.current, cardAnchorSelector)
    onSubmitScrollAnchorCapture?.(submitScrollAnchorRef.current)
  }, [cardAnchorSelector, onSubmitScrollAnchorCapture])
  const submitWithoutScrollJump = useCallback(() => {
    const scrollAnchor = submitScrollAnchorRef.current
    const restoreAfterLayoutChange = () => {
      if (scrollAnchor) {
        restoreScrollAnchor(scrollAnchor)
      }
    }
    setIsChanged(false)
    const result = onSubmit()
    const clearAnchor = () => onSubmitScrollAnchorClear?.(scrollAnchor)

    restoreAfterLayoutChange()

    if (result instanceof Promise) {
      void result.finally(() => {
        restoreAfterLayoutChange()
        clearAnchor()
      })
      return
    }

    clearAnchor()
  }, [onSubmit, onSubmitScrollAnchorClear])

  return (
    <div ref={cardRef} data-sub-question-card-id={cardAnchorId} className={cardClassName}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex select-none items-center justify-between gap-2 h-[20px]">
            <p className={`text-[10px] uppercase tracking-[0.18em] ${completed
              ? 'text-gray-400 dark:text-gray-500'
              : current
                ? 'text-blue-500 dark:text-blue-400 font-bold'
                : 'text-gray-500 dark:text-gray-400'
              }`}>
              Question #{question.order_number}
            </p>
            {completed ? (
              <span className="shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-650 border border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 font-bold select-none">
                <Check className="h-3 w-3" />
                Solved
              </span>
            ) : (
              !completed && typeof result === 'boolean' && result === false && answer?.trim() && !isChanged && (
                <span className="shrink-0 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 font-bold select-none animate-pulse-once">
                  <X className="h-3 w-3" />
                  Incorrect
                </span>
              )
            )}
          </div>
          <div className={`mt-1 max-w-full select-text overflow-x-auto break-words text-sm font-semibold ${completed ? 'text-gray-500 dark:text-gray-450' : 'text-gray-900 dark:text-white'}`}>
            <QuestionMarkdown content={questionContent} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={answer}
          onFocus={undefined}
          onChange={
            completed
              ? undefined
              : (event) => {
                onAnswerChange(event.target.value)
                setIsChanged(true)
              }
          }
          placeholder={completed ? 'Answer saved' : 'Type your answer...'}
          className={
            completed
              ? "h-8 flex-1 bg-gray-500/5 border border-gray-200/30 rounded-lg text-xs px-2.5 text-gray-400 dark:bg-[#0e1320]/20 dark:border-gray-800/40 dark:text-gray-500 cursor-not-allowed select-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 transition-all duration-200"
              : "h-8 flex-1 bg-white/40 border border-gray-200/50 rounded-lg text-xs px-2.5 text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-blue-500/50 dark:bg-[#0e1320]/40 dark:border-gray-800/80 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500/50 transition-all duration-200"
          }
          readOnly={completed}

          onKeyDown={(event) => {
            if (!completed && event.key === 'Enter') {
              event.preventDefault()
              prepareSubmitScrollRestore()
              submitWithoutScrollJump()
            }
          }}
        />
        {!completed && (
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault()
              prepareSubmitScrollRestore()
            }}
            onTouchStart={prepareSubmitScrollRestore}
            onClick={submitWithoutScrollJump}
            disabled={submitting || !answer?.trim()}
            className="h-8 select-none rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20 px-3 text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed min-w-[64px] flex items-center justify-center shrink-0"
          >
            {submitting ? '...' : 'Check'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function SubChallengePanel({
  challengeId,
  loaded,
  loading,
  submitting,
  mode,
  questions,
  nextQuestion,
  answers,
  results,
  completed,
  flag,
  message,
  onAnswerChange,
  onSubmit,
  onReset,
}: SubChallengePanelProps) {
  const [copiedQA, setCopiedQA] = useState(false)
  const pendingScrollAnchorRef = useRef<ScrollAnchorSnapshot | null>(null)

  const handleCopyQuestionsAndAnswers = useCallback(() => {
    let markdown = '## Question\n'
    const sortedQuestions = [...questions].sort((a, b) => a.order_number - b.order_number)

    sortedQuestions.forEach((q) => {
      const qContent = normalizeQuestionMarkdown(q.question)
      markdown += `### Question ${q.order_number}\n${qContent}\n\n`
    })

    markdown += '## Answer\n'
    sortedQuestions.forEach((q) => {
      const ansKey = String(q.order_number)
      const ansVal = answers[ansKey] || ''
      markdown += `### Answer ${q.order_number}\n${ansVal}\n\n`
    })

    markdown = markdown.trim()

    if (!navigator.clipboard) {
      toast.error('Clipboard not available')
      return
    }

    navigator.clipboard.writeText(markdown).then(() => {
      setCopiedQA(true)
      setTimeout(() => setCopiedQA(false), 2000)
      toast.success('Copied Q&A to clipboard')
    }).catch((err) => {
      console.error('Failed to copy Q&A', err)
      toast.error('Failed to copy Q&A')
    })
  }, [questions, answers])
  const pendingScrollAnchorClearTimerRef = useRef<number | null>(null)
  const submitAllButtonRef = useRef<HTMLButtonElement>(null)
  const submitAllScrollPositionRef = useRef({ x: 0, y: 0 })
  const submitAllScrollAnchorRef = useRef<ScrollAnchorSnapshot | null>(null)
  const subChallengeFlagCopyKey = `${challengeId}-sub-flag`
  const hasQuestions =
    mode === 'non_sequential'
      ? questions.length > 0
      : mode === 'sequential'
        ? !!nextQuestion || completed
        : false
  const isShowingEmptyQuestionMessage = !loading && loaded && !hasQuestions
  const capturePendingScrollAnchor = useCallback((snapshot: ScrollAnchorSnapshot | null) => {
    if (pendingScrollAnchorClearTimerRef.current) {
      window.clearTimeout(pendingScrollAnchorClearTimerRef.current)
      pendingScrollAnchorClearTimerRef.current = null
    }

    pendingScrollAnchorRef.current = snapshot
    restoreScrollAnchor(snapshot)
  }, [])
  const clearPendingScrollAnchor = useCallback((snapshot: ScrollAnchorSnapshot | null) => {
    if (!snapshot) return

    if (pendingScrollAnchorClearTimerRef.current) {
      window.clearTimeout(pendingScrollAnchorClearTimerRef.current)
    }

    pendingScrollAnchorClearTimerRef.current = window.setTimeout(() => {
      if (pendingScrollAnchorRef.current === snapshot) {
        pendingScrollAnchorRef.current = null
      }
      pendingScrollAnchorClearTimerRef.current = null
    }, 500)
  }, [])
  const saveSubmitAllScrollPosition = useCallback(() => {
    submitAllScrollPositionRef.current = { x: window.scrollX, y: window.scrollY }
  }, [])
  const prepareSubmitAllScrollRestore = useCallback(() => {
    saveSubmitAllScrollPosition()
    submitAllScrollAnchorRef.current = captureScrollAnchor(submitAllButtonRef.current)
    capturePendingScrollAnchor(submitAllScrollAnchorRef.current)
  }, [capturePendingScrollAnchor, saveSubmitAllScrollPosition])
  const submitAllWithoutScrollJump = useCallback(() => {
    const scrollPosition = submitAllScrollPositionRef.current
    const scrollAnchor = submitAllScrollAnchorRef.current
    const restoreAfterLayoutChange = () => {
      if (scrollAnchor) {
        restoreScrollAnchor(scrollAnchor)
        return
      }

      requestAnimationFrame(() => {
        window.scrollTo({ left: scrollPosition.x, top: scrollPosition.y, behavior: 'auto' })
      })
      window.setTimeout(() => {
        window.scrollTo({ left: scrollPosition.x, top: scrollPosition.y, behavior: 'auto' })
      }, 50)
      window.setTimeout(() => {
        window.scrollTo({ left: scrollPosition.x, top: scrollPosition.y, behavior: 'auto' })
      }, 150)
    }
    const result = onSubmit()
    const clearAnchor = () => clearPendingScrollAnchor(scrollAnchor)

    restoreAfterLayoutChange()

    if (result instanceof Promise) {
      void result.finally(() => {
        restoreAfterLayoutChange()
        clearAnchor()
      })
      return
    }

    clearAnchor()
  }, [clearPendingScrollAnchor, onSubmit])

  useLayoutEffect(() => {
    restoreScrollAnchor(pendingScrollAnchorRef.current)
  }, [completed, flag, message, nextQuestion, questions, results, submitting])

  useLayoutEffect(() => {
    return () => {
      if (pendingScrollAnchorClearTimerRef.current) {
        window.clearTimeout(pendingScrollAnchorClearTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-3 min-w-0 overflow-x-hidden">
      {loading && !hasQuestions && (
        <div className="select-none text-sm text-gray-300">Loading questions...</div>
      )}

      {isShowingEmptyQuestionMessage && (
        <div className="select-none text-sm text-gray-300">
          {message || 'No sub-question configured for this challenge.'}
        </div>
      )}

      {!loading && mode !== 'none' && (
        <div className="space-y-2.5">
          {mode === 'non_sequential' ? (
            questions.map((question) => {
              const orderKey = String(question.order_number)
              const isCompleted = results[orderKey] === true

              return (
                <QuestionCard
                  key={question.order_number}
                  cardAnchorId={`${challengeId}-${question.order_number}`}
                  question={question}
                  answer={answers[orderKey] || ''}
                  result={results[orderKey]}
                  submitting={submitting}
                  completed={isCompleted}
                  onAnswerChange={(value) => onAnswerChange(question.order_number, value)}
                  onSubmit={() => onSubmit(question.order_number)}
                  onSubmitScrollAnchorCapture={capturePendingScrollAnchor}
                  onSubmitScrollAnchorClear={clearPendingScrollAnchor}
                />
              )
            })
          ) : (
            <>
              {questions.filter((question) => results[String(question.order_number)] === true).map((question) => (
                <QuestionCard
                  key={question.order_number}
                  cardAnchorId={`${challengeId}-${question.order_number}`}
                  question={question}
                  answer={answers[String(question.order_number)] || ''}
                  result={results[String(question.order_number)]}
                  submitting={submitting}
                  completed
                  onAnswerChange={() => { }}
                  onSubmit={() => { }}
                  onSubmitScrollAnchorCapture={capturePendingScrollAnchor}
                  onSubmitScrollAnchorClear={clearPendingScrollAnchor}
                />
              ))}

              {!completed && nextQuestion && (
                <QuestionCard
                  cardAnchorId={`${challengeId}-${nextQuestion.order_number}`}
                  question={nextQuestion}
                  answer={answers[String(nextQuestion.order_number)] || ''}
                  result={results[String(nextQuestion.order_number)]}
                  submitting={submitting}
                  completed={false}
                  current
                  onAnswerChange={(value) => onAnswerChange(nextQuestion.order_number, value)}
                  onSubmit={() => onSubmit(nextQuestion.order_number)}
                  onSubmitScrollAnchorCapture={capturePendingScrollAnchor}
                  onSubmitScrollAnchorClear={clearPendingScrollAnchor}
                />
              )}
            </>
          )}
        </div>
      )}
      {message && !isShowingEmptyQuestionMessage && (
        <div className="select-none rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
          {message}
        </div>
      )}

      {hasQuestions && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {mode === 'non_sequential' && (
              <button
                ref={submitAllButtonRef}
                type="button"
                disabled={completed || submitting || !Object.values(answers).some((value) => value?.trim())}
                onMouseDown={(event) => {
                  event.preventDefault()
                  prepareSubmitAllScrollRestore()
                }}
                onTouchStart={prepareSubmitAllScrollRestore}
                onClick={submitAllWithoutScrollJump}
                className={`h-8 w-[160px] select-none rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center shrink-0 ${completed
                  ? 'bg-gray-500/10 text-gray-500 border border-gray-200/20 dark:bg-gray-500/5 dark:text-gray-550 dark:border-gray-800/40 cursor-not-allowed'
                  : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-550 active:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
              >
                {completed ? (
                  'Answers Submitted'
                ) : submitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </span>
                ) : (
                  'Submit All Answers'
                )}
              </button>
            )}

            {completed && !flag && (
              <div className="select-none px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-450 truncate">
                All questions correct.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyQuestionsAndAnswers}
            className="h-8 select-none rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20 px-3 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 w-[110px] shrink-0 ml-auto"
          >
            {copiedQA ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Q&A</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
