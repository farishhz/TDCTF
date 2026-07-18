-- ==============================================
-- Performance indexes
-- Safe to run on existing databases.
-- ==============================================

-- Admin/user filtering and case-insensitive username lookups.
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at);
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON public.users((lower(username)));

-- Challenge list, event filtering, distribution counts, and service filtering.
CREATE INDEX IF NOT EXISTS idx_challenges_active_event_points_solves
  ON public.challenges(is_active, event_id, points, total_solves);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON public.challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_difficulty ON public.challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_challenges_services_gin
  ON public.challenges USING GIN (services);

-- Solve history, leaderboard, first blood, and admin recent-solves queries.
CREATE INDEX IF NOT EXISTS idx_solves_user_created_at
  ON public.solves(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solves_challenge_created_at
  ON public.solves(challenge_id, created_at ASC, id ASC);
CREATE INDEX IF NOT EXISTS idx_solves_created_at_challenge_user
  ON public.solves(created_at DESC, challenge_id, user_id);

-- Event membership/admin screens and pending join request review.
CREATE INDEX IF NOT EXISTS idx_event_join_requests_pending_event_requested
  ON public.event_join_requests(event_id, requested_at DESC)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_event_participants_event_joined
  ON public.event_participants(event_id, joined_at ASC);
CREATE INDEX IF NOT EXISTS idx_event_admins_event_user
  ON public.event_admins(event_id, user_id);

-- Team leaderboard/profile queries.
CREATE INDEX IF NOT EXISTS idx_teams_captain_user_id ON public.teams(captain_user_id);
CREATE INDEX IF NOT EXISTS idx_teams_name_lower ON public.teams((lower(name)));
CREATE INDEX IF NOT EXISTS idx_team_members_team_joined
  ON public.team_members(team_id, joined_at ASC);

-- Notification/audit-list ordering.
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications(created_at DESC);
