export interface RemoteProfileRow {
  avatar_path: string | null;
  bio: string;
  display_name: string;
  onboarding_completed_at: number | string | null;
  streak_days: number;
  total_xp: number;
  updated_at: number | string;
  user_id: string;
  weight_unit: 'kg' | 'lb';
}

export interface RemoteFastRow {
  completed: boolean;
  deleted_at: number | string | null;
  end_time: number | string;
  record_key: string;
  start_time: number | string;
  target_hours: number;
  updated_at: number | string;
  user_id: string;
  xp_earned: number;
}

export interface RemoteMealRow {
  carbs_grams: number | null;
  deleted_at: number | string | null;
  estimated_calories: number | null;
  fat_grams: number | null;
  protein_grams: number | null;
  record_key: string;
  tags: string[];
  timestamp: number | string;
  updated_at: number | string;
  user_id: string;
  xp_earned: number;
}

export interface RemoteWorkoutRow {
  duration_minutes: number;
  effort: 'light' | 'moderate' | 'intense';
  notes: string | null;
  record_key: string;
  timestamp: number | string;
  type: string;
  updated_at: number | string;
  user_id: string;
  xp_earned: number;
}

export interface RemoteFriendRow {
  created_at: number | string;
  display_name: string;
  record_key: string;
  updated_at: number | string;
  user_id: string;
}

export interface RemoteWeightRow {
  record_key: string;
  timestamp: number | string;
  updated_at: number | string;
  user_id: string;
  weight_grams: number;
}

export interface CloudSyncResult {
  downloadedRecords: number;
  syncedAt: number;
  uploadedRecords: number;
}
