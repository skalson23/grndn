import {
  Document,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

import type { OnboardingData } from '@/components/onboarding/onboarding-context'
import type { WorkoutPlan } from '@/lib/workout-plan/schema'

import { BRAND_HORIZONTAL_SRC, BRAND_NAME, BRAND_PDF_AUTHOR } from '@/lib/brand'
import { ACTIVITY_LEVEL_LABELS } from '@/lib/onboarding/activity-level'
import { estimateTdee } from '@/lib/onboarding/tdee'
import { TRAINING_STYLE_LABELS } from '@/lib/onboarding/training-style'
import type { TrainingStyleId } from '@/lib/onboarding/training-style'

import { pdfColors, pdfSpacing, PDF_PAGE_SIZE } from './theme'

type WeeklySession = WorkoutPlan['weeklySessions'][number]

/** Usable width inside page padding (390 - 32*2) */
const CONTENT_WIDTH = PDF_PAGE_SIZE[0] - pdfSpacing.pagePadding * 2

const styles = StyleSheet.create({
  page: {
    backgroundColor: pdfColors.background,
    color: pdfColors.foreground,
    paddingTop: pdfSpacing.pagePadding,
    paddingHorizontal: pdfSpacing.pagePadding,
    paddingBottom: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  sessionPage: {
    backgroundColor: pdfColors.background,
    color: pdfColors.foreground,
    paddingTop: 28,
    paddingHorizontal: pdfSpacing.pagePadding,
    paddingBottom: 44,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
  },
  horizontalLogo: {
    height: 52,
    width: 238,
    objectFit: 'contain',
    objectPosition: 'left',
  },
  horizontalLogoSm: {
    height: 38,
    width: 180,
    objectFit: 'contain',
    objectPosition: 'left',
  },
  planTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.25,
    marginBottom: 8,
    maxWidth: CONTENT_WIDTH,
  },
  planSummary: {
    fontSize: 9,
    color: pdfColors.muted,
    lineHeight: 1.5,
    marginBottom: 16,
    maxWidth: CONTENT_WIDTH,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  metaPill: {
    backgroundColor: pdfColors.surfaceElevated,
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 7,
    color: pdfColors.muted,
  },
  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.accent,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  splitCard: {
    width: CONTENT_WIDTH,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: pdfColors.surface,
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  dayBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: pdfColors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  dayBadgeText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.accent,
  },
  splitTextColumn: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: CONTENT_WIDTH - 44,
  },
  splitTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.35,
    marginBottom: 3,
  },
  splitSubtitle: {
    fontSize: 8,
    color: pdfColors.muted,
    lineHeight: 1.4,
    marginBottom: 2,
  },
  splitMeta: {
    fontSize: 7,
    color: pdfColors.muted,
    lineHeight: 1.35,
  },
  sessionHero: {
    width: CONTENT_WIDTH,
    flexDirection: 'column',
    marginBottom: 14,
  },
  sessionDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionDayPill: {
    backgroundColor: pdfColors.accentMuted,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  sessionDayPillText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.accent,
    letterSpacing: 0.6,
  },
  sessionDurationPill: {
    backgroundColor: pdfColors.surfaceElevated,
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sessionDurationText: {
    fontSize: 7,
    color: pdfColors.muted,
  },
  sessionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.25,
    marginBottom: 6,
    maxWidth: CONTENT_WIDTH,
  },
  sessionFocus: {
    fontSize: 9,
    color: pdfColors.muted,
    lineHeight: 1.45,
    maxWidth: CONTENT_WIDTH,
  },
  sectionDivider: {
    width: CONTENT_WIDTH,
    height: 1,
    backgroundColor: pdfColors.border,
    marginBottom: 14,
  },
  sessionBody: {
    width: CONTENT_WIDTH,
    flexDirection: 'column',
  },
  listSection: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.border,
  },
  listLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.muted,
    marginBottom: 5,
    letterSpacing: 0.6,
  },
  listLine: {
    fontSize: 8,
    lineHeight: 1.45,
    color: pdfColors.foreground,
    marginBottom: 3,
    maxWidth: CONTENT_WIDTH - 8,
  },
  exerciseCard: {
    width: '100%',
    flexDirection: 'column',
    backgroundColor: pdfColors.surface,
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.35,
    marginBottom: 3,
    maxWidth: CONTENT_WIDTH - 28,
  },
  exerciseCue: {
    fontSize: 7,
    color: pdfColors.muted,
    lineHeight: 1.4,
    marginBottom: 6,
    maxWidth: CONTENT_WIDTH - 28,
  },
  exerciseStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: pdfColors.border,
    paddingTop: 6,
  },
  statCell: {
    flexDirection: 'column',
    width: '33.33%',
    paddingRight: 4,
  },
  statLabel: {
    fontSize: 6,
    color: pdfColors.muted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.3,
  },
  progressionBox: {
    width: CONTENT_WIDTH,
    flexDirection: 'column',
    backgroundColor: pdfColors.surface,
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderLeftWidth: 3,
    borderLeftColor: pdfColors.accent,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  progressionBoxCompact: {
    width: CONTENT_WIDTH,
    flexDirection: 'column',
    backgroundColor: pdfColors.surface,
    borderWidth: 1,
    borderColor: pdfColors.border,
    borderLeftWidth: 3,
    borderLeftColor: pdfColors.accent,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  progressionText: {
    fontSize: 9,
    lineHeight: 1.55,
    maxWidth: CONTENT_WIDTH - 24,
  },
  progressionTextCompact: {
    fontSize: 7,
    lineHeight: 1.5,
    color: pdfColors.muted,
    maxWidth: CONTENT_WIDTH - 20,
  },
  notesBox: {
    width: CONTENT_WIDTH,
    flexDirection: 'column',
    backgroundColor: pdfColors.surface,
    borderWidth: 1,
    borderColor: pdfColors.destructive,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.destructive,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8,
    lineHeight: 1.5,
    color: pdfColors.muted,
    maxWidth: CONTENT_WIDTH - 24,
  },
  footer: {
    width: CONTENT_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: pdfColors.border,
  },
  footerText: {
    fontSize: 7,
    color: pdfColors.muted,
  },
  sessionFooter: {
    width: CONTENT_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: pdfColors.border,
  },
  pageIndicator: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.accent,
    letterSpacing: 0.5,
  },
})

export type WorkoutPlanPdfProps = {
  plan: WorkoutPlan
  profile?: OnboardingData | null
  generatedAt?: Date
}

function formatRest(seconds: number | null): string {
  if (seconds == null) return '—'
  if (seconds >= 60) return `${Math.round(seconds / 60)}m`
  return `${seconds}s`
}

function BrandHeader({ compact = false }: { compact?: boolean }) {
  return (
    <View style={compact ? styles.compactHeader : styles.header}>
      <Image
        src={BRAND_HORIZONTAL_SRC}
        style={compact ? styles.horizontalLogoSm : styles.horizontalLogo}
      />
    </View>
  )
}

function ProfileMeta({ profile }: { profile?: OnboardingData | null }) {
  if (!profile) return null
  const styleLabel =
    TRAINING_STYLE_LABELS[profile.trainingStyle as TrainingStyleId] ||
    profile.trainingStyle
  const activityLabel =
    ACTIVITY_LEVEL_LABELS[
      profile.activityLevel as keyof typeof ACTIVITY_LEVEL_LABELS
    ] || profile.activityLevel
  const tdee = profile.activityLevel ? estimateTdee(profile) : null
  const items = [
    `${profile.frequency}× / week`,
    `${profile.duration} min`,
    profile.experience,
    ...(activityLabel ? [activityLabel] : []),
    ...(tdee ? [`~${tdee.maintenanceCalories} kcal maintenance`] : []),
    ...(styleLabel ? [styleLabel] : []),
  ]

  return (
    <View style={styles.metaRow}>
      {items.map((label) => (
        <View key={label} style={styles.metaPill}>
          <Text style={styles.metaText}>{label}</Text>
        </View>
      ))}
    </View>
  )
}

function ListSection({ title, lines }: { title: string; lines: string[] }) {
  return (
    <View style={styles.listSection} wrap={false}>
      <Text style={styles.listLabel}>{title.toUpperCase()}</Text>
      {lines.map((line, i) => (
        <Text key={`${title}-${i}`} style={styles.listLine}>
          • {line}
        </Text>
      ))}
    </View>
  )
}

function ExerciseCard({
  name,
  sets,
  repsOrDuration,
  restSeconds,
  coachingCue,
}: {
  name: string
  sets: number
  repsOrDuration: string
  restSeconds: number | null
  coachingCue: string | null
}) {
  return (
    <View style={styles.exerciseCard} wrap={false}>
      <Text style={styles.exerciseName}>{name}</Text>
      {coachingCue != null && coachingCue !== '' && (
        <Text style={styles.exerciseCue}>{coachingCue}</Text>
      )}
      <View style={styles.exerciseStatsRow}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>SETS</Text>
          <Text style={styles.statValue}>{String(sets)}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>REPS</Text>
          <Text style={styles.statValue}>{repsOrDuration}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>REST</Text>
          <Text style={styles.statValue}>{formatRest(restSeconds)}</Text>
        </View>
      </View>
    </View>
  )
}

function PageFooter({
  dateLabel,
  dayIndex,
  totalDays,
}: {
  dateLabel: string
  dayIndex?: number
  totalDays?: number
}) {
  return (
    <View style={dayIndex != null ? styles.sessionFooter : styles.footer}>
      <Text style={styles.footerText}>
        {BRAND_NAME} · {dateLabel}
      </Text>
      {dayIndex != null && totalDays != null ? (
        <Text style={styles.pageIndicator}>
          DAY {dayIndex} OF {totalDays}
        </Text>
      ) : (
        <Text style={styles.footerText}>Program overview</Text>
      )}
    </View>
  )
}

/** Entire session on one PDF page — no cross-page splits for this day. */
function SessionDayPage({
  session,
  progressionInstructions,
  safetyNotes,
  dateLabel,
  totalDays,
}: {
  session: WeeklySession
  progressionInstructions: string
  safetyNotes: string | null
  dateLabel: string
  totalDays: number
}) {
  return (
    <Page
      key={`day-${session.order}`}
      size={PDF_PAGE_SIZE}
      style={styles.sessionPage}
      wrap={false}
    >
      <View wrap={false}>
        <BrandHeader compact />
        <View style={styles.sessionHero}>
          <View style={styles.sessionDayRow}>
            <View style={styles.sessionDayPill}>
              <Text style={styles.sessionDayPillText}>
                TRAINING DAY {session.order}
              </Text>
            </View>
            <View style={styles.sessionDurationPill}>
              <Text style={styles.sessionDurationText}>
                ~{session.estimatedMinutes} min
              </Text>
            </View>
          </View>
          <Text style={styles.sessionTitle}>{session.name}</Text>
          <Text style={styles.sessionFocus}>{session.primaryFocus}</Text>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.sessionBody}>
          {session.warmup != null && session.warmup.length > 0 && (
            <ListSection title="Warm-up" lines={session.warmup} />
          )}

          <Text style={styles.sectionLabel}>MAIN WORK</Text>
          {session.exercises.map((ex, i) => (
            <ExerciseCard
              key={`${session.order}-ex-${i}`}
              name={ex.name}
              sets={ex.sets}
              repsOrDuration={ex.repsOrDuration}
              restSeconds={ex.restSeconds}
              coachingCue={ex.coachingCue}
            />
          ))}

          {session.cooldown != null && session.cooldown.length > 0 && (
            <ListSection title="Cool-down" lines={session.cooldown} />
          )}

          <Text style={styles.sectionLabel}>PROGRESSION</Text>
          <View style={styles.progressionBoxCompact} wrap={false}>
            <Text style={styles.progressionTextCompact}>
              {progressionInstructions}
            </Text>
          </View>

          {safetyNotes != null && safetyNotes !== '' && (
            <>
              <Text style={styles.sectionLabel}>SAFETY NOTES</Text>
              <View style={styles.notesBox} wrap={false}>
                <Text style={styles.notesTitle}>Limitations</Text>
                <Text style={styles.notesText}>{safetyNotes}</Text>
              </View>
            </>
          )}
        </View>

        <PageFooter
          dateLabel={dateLabel}
          dayIndex={session.order}
          totalDays={totalDays}
        />
      </View>
    </Page>
  )
}

function CoverPage({
  plan,
  profile,
  sortedSessions,
  dateLabel,
}: {
  plan: WorkoutPlan
  profile?: OnboardingData | null
  sortedSessions: WeeklySession[]
  dateLabel: string
}) {
  return (
    <Page size={PDF_PAGE_SIZE} style={styles.page} wrap={false}>
      <BrandHeader />
      <Text style={styles.planTitle}>{plan.planTitle}</Text>
      <Text style={styles.planSummary}>{plan.planSummary}</Text>
      <ProfileMeta profile={profile} />

      <Text style={styles.sectionLabel}>YOUR WEEKLY SPLIT</Text>
      {sortedSessions.map((session) => (
        <View
          key={`split-${session.order}`}
          style={styles.splitCard}
          wrap={false}
        >
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>{String(session.order)}</Text>
          </View>
          <View style={styles.splitTextColumn}>
            <Text style={styles.splitTitle}>{session.name}</Text>
            <Text style={styles.splitSubtitle}>{session.primaryFocus}</Text>
            <Text style={styles.splitMeta}>
              ~{session.estimatedMinutes} min · {session.exercises.length}{' '}
              exercises
            </Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionLabel}>PROGRAM PROGRESSION</Text>
      <View style={styles.progressionBox} wrap={false}>
        <Text style={styles.progressionText}>{plan.progressionInstructions}</Text>
      </View>

      {plan.safetyNotes != null && plan.safetyNotes !== '' && (
        <>
          <Text style={styles.sectionLabel}>SAFETY & NOTES</Text>
          <View style={styles.notesBox} wrap={false}>
            <Text style={styles.notesTitle}>Safety & limitations</Text>
            <Text style={styles.notesText}>{plan.safetyNotes}</Text>
          </View>
        </>
      )}

      <PageFooter dateLabel={dateLabel} />
    </Page>
  )
}

export function WorkoutPlanPdfDocument({
  plan,
  profile,
  generatedAt = new Date(),
}: WorkoutPlanPdfProps) {
  const dateLabel = generatedAt.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const sortedSessions = [...plan.weeklySessions].sort(
    (a, b) => a.order - b.order
  )
  const totalDays = sortedSessions.length

  return (
    <Document
      title={plan.planTitle}
      author={BRAND_PDF_AUTHOR}
      subject="Workout Plan"
    >
      <CoverPage
        plan={plan}
        profile={profile}
        sortedSessions={sortedSessions}
        dateLabel={dateLabel}
      />

      {sortedSessions.map((session) => (
        <SessionDayPage
          key={`session-page-${session.order}`}
          session={session}
          progressionInstructions={plan.progressionInstructions}
          safetyNotes={plan.safetyNotes}
          dateLabel={dateLabel}
          totalDays={totalDays}
        />
      ))}
    </Document>
  )
}
