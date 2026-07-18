'use client'

import { CheckCircle2, Flame, ListChecks, Target } from 'lucide-react'
import { Button } from '@/shared/ui'
import { formatRelativeDate } from '@/shared/lib'
import type { ChallengeWithSolve } from '@/shared/types'
import { UserEmptyState, UserSection } from '../ui'
import ProfileChallengeListItem from './ProfileChallengeListItem'
import ProfileChallengesModal from './ProfileChallengesModal'

type SolvedChallengesProps = {
  solvedChallenges: ChallengeWithSolve[]
  firstBloodIds: string[]
  showAllModal: boolean
  setShowAllModal: (show: boolean) => void
  onShowUnsolved: () => void
}

export default function SolvedChallenges({
  solvedChallenges,
  firstBloodIds,
  showAllModal,
  setShowAllModal,
  onShowUnsolved
}: SolvedChallengesProps) {
  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onShowUnsolved}
        className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
      >
        <Target className="h-3.5 w-3.5" />
        Show Unsolved
      </Button>
      {solvedChallenges.length > 10 && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAllModal(true)}
          className="rounded-full border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400"
        >
          <ListChecks className="h-3.5 w-3.5" />
          Show All
        </Button>
      )}
    </div>
  )

  return (
    <div>
      <UserSection
        icon={CheckCircle2}
        title="Recent Solved Challenges"
        description="A compact view of the latest completed challenges."
        action={actions}
        contentClassName="space-y-2.5"
      >
        {solvedChallenges.length === 0 ? (
          <UserEmptyState
            icon={CheckCircle2}
            title="No solved challenges yet"
            description="Solved challenges will appear here."
          />
        ) : (
          <div className="grid gap-2.5">
            {solvedChallenges.slice(0, 10).map((challenge) => (
              <ChallengeRow
                key={challenge.id}
                challenge={challenge}
                firstBlood={firstBloodIds.includes(challenge.id)}
              />
            ))}
          </div>
        )}
      </UserSection>

      <ProfileChallengesModal
        open={showAllModal}
        onOpenChange={setShowAllModal}
        mode="solved"
        challenges={solvedChallenges}
        firstBloodIds={firstBloodIds}
        onSwitchMode={() => {
          setShowAllModal(false)
          onShowUnsolved()
        }}
      />
    </div>
  )
}

function ChallengeRow({
  challenge,
  firstBlood,
}: {
  challenge: ChallengeWithSolve
  firstBlood: boolean
}) {
  return (
    <div className="transition-transform duration-200 hover:-translate-y-0.5">
      <ProfileChallengeListItem
        title={challenge.title}
        subtitle={
          <p className="truncate">
            {(challenge.category || '').replace(/\//g, ' / ')} / {challenge.difficulty} / {challenge.solved_at ? formatRelativeDate(challenge.solved_at) : '-'}
          </p>
        }
        trailing={(
          <div className="grid grid-cols-[96px_56px] items-center gap-2">
            {firstBlood ? (
              <span className="inline-flex w-24 items-center justify-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-2 py-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                <Flame className="h-3 w-3 fill-red-500 text-red-500" />
                First Blood
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="inline-flex w-14 items-center justify-center rounded-full bg-blue-500/10 px-2 py-1 text-sm font-bold text-blue-600 dark:text-blue-400">
              +{challenge.points}
            </span>
          </div>
        )}
      />
    </div>
  )
}
