// Section and Style Types
export interface SectionStyleConfig {
  alignment?: 'left' | 'center' | 'right';
  font_size?: 'small' | 'medium' | 'large';
  color?: string;
  background_color?: string;
  margin?: 'small' | 'normal' | 'large';
}

export interface DaySection {
  id: string;
  day_number: number;
  section_type: 'title' | 'text' | 'image' | 'video' | 'audio' | 'quote' | 'divider';
  content_text?: string;
  position_order: number;
  style_config?: SectionStyleConfig;
  media_asset_id?: string;
  media_asset?: MediaAsset;
  created_at: string;
  updated_at: string;
}

export interface DaySectionCreate {
  day_number: number;
  section_type: 'title' | 'text' | 'image' | 'video' | 'audio' | 'quote' | 'divider';
  content_text?: string;
  position_order: number;
  style_config?: SectionStyleConfig;
  media_asset_id?: string;
}

// Audio Configuration Types
export interface AudioConfig {
  autoplay?: boolean;
  loop?: boolean;
  volume?: number; // 0.0 to 1.0
  background_mode?: boolean; // true for background, false for interactive
  fade_on_video?: boolean; // whether to fade background audio when video plays
  video_volume_ratio?: number; // background audio volume when video plays (0.0 to 1.0)
}

// Media Configuration Types
export interface MediaConfig {
  // Audio specific config
  autoplay?: boolean;
  loop?: boolean;
  volume?: number; // 0.0 to 1.0
  background_mode?: boolean;
  controls?: boolean;
  
  // Video specific config
  muted?: boolean;
  poster?: string;
  
  // Image specific config
  alt_text?: string;
  caption?: string;
}

// API Response Types
export interface CountdownDay {
  id: number;
  day_number: number;
  title: string;
  content_html?: string; // Legacy support
  background_audio_id?: string;
  audio_config?: AudioConfig;
  release_datetime_utc: string;
  created_at: string;
  updated_at: string;
  is_unlocked: boolean;
  sections: DaySection[];
  media_assets: MediaAsset[];
  background_audio?: MediaAsset;
}

export interface PublicCountdownDay {
  day_number: number;
  title: string;
  content_html?: string; // Legacy support
  sections: DaySection[];
  background_audio?: MediaAsset;
  audio_config?: AudioConfig;
  is_unlocked: boolean;
}

export interface CountdownOverview {
  days: PublicCountdownDay[];
  current_day?: number;
  total_days: number;
}

export interface MediaAsset {
  id: string;
  filename: string;
  file_key: string;
  file_size: number;
  mime_type: string;
  media_config?: MediaConfig;
  uploaded_at: string;
  day_number?: number;
  url: string;
}

export interface MediaUploadResponse {
  id: string;
  filename: string;
  file_key: string;
  file_size: number;
  mime_type: string;
  url: string;
  uploaded_at: string;
  media_config?: MediaConfig;
}

// Auth Types
export interface AdminLoginRequest {
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
}

export interface ValidationResponse {
  valid: boolean;
  message: string;
}

// Update Types
export interface CountdownDayUpdate {
  title?: string;
  content_html?: string;
  background_audio_id?: string;
  audio_config?: AudioConfig;
}

export interface SectionsUpdateRequest {
  sections: DaySectionCreate[];
}

export interface MediaAssetUpdate {
  media_config?: MediaConfig;
}

// API Error Type
export interface APIError {
  detail: string;
  error_code?: string;
}

// Component Props Types
export interface CountdownCardProps {
  day: PublicCountdownDay;
  onClick: (dayNumber: number) => void;
  className?: string;
}

export interface DayViewProps {
  dayNumber: number;
  isPreview?: boolean;
}

export interface AdminDayEditorProps {
  dayNumber: number;
  onSave: (data: CountdownDayUpdate) => void;
  onCancel: () => void;
}

export interface SectionEditorProps {
  section: DaySection;
  onUpdate: (section: DaySection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export interface AudioControlsProps {
  audioConfig: AudioConfig;
  onConfigChange: (config: AudioConfig) => void;
  backgroundAudio?: MediaAsset;
  onBackgroundAudioChange: (mediaId?: string) => void;
  availableAudio: MediaAsset[];
}

// App State Types
export interface AppState {
  isAuthenticated: boolean;
  currentDay?: number;
  totalDays: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  loading: boolean;
  error?: string;
}

// Form Types
export interface LoginFormData {
  password: string;
}

export interface DayEditFormData {
  title: string;
  content_html: string;
}

// Hook Types
export interface UseCountdownReturn {
  overview?: CountdownOverview;
  loading: boolean;
  error?: string;
  refetch: () => void;
}

export interface UseAdminCountdownReturn {
  days?: CountdownDay[];
  loading: boolean;
  error?: string;
  updateDay: (dayNumber: number, data: CountdownDayUpdate) => Promise<void>;
  refetch: () => void;
}

export interface UseAuthReturn {
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => void;
  error?: string;
}

export interface UseSectionsReturn {
  sections: DaySection[];
  loading: boolean;
  error?: string;
  updateSections: (sections: DaySectionCreate[]) => Promise<void>;
  addSection: (section: Omit<DaySectionCreate, 'day_number' | 'position_order'>) => void;
  removeSection: (sectionId: string) => void;
  moveSection: (sectionId: string, direction: 'up' | 'down') => void;
  refetch: () => void;
}

// Route Types
export interface RouteParams {
  dayNumber?: string;
}

// Storage Types
export interface StorageKeys {
  AUTH_TOKEN: 'anniversary_auth_token';
}

// Constants
export const STORAGE_KEYS: StorageKeys = {
  AUTH_TOKEN: 'anniversary_auth_token'
} as const;

export const API_ENDPOINTS = {
  // Public endpoints
  COUNTDOWN_OVERVIEW: '/api/countdown',
  COUNTDOWN_DAY: (dayNumber: number) => `/api/countdown/${dayNumber}`,
  
  // Admin endpoints
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_VALIDATE: '/api/admin/validate-token',
  ADMIN_COUNTDOWN: '/api/admin/countdown',
  ADMIN_COUNTDOWN_DAY: (dayNumber: number) => `/api/admin/countdown/${dayNumber}`,
  ADMIN_DAY_SECTIONS: (dayNumber: number) => `/api/admin/countdown/${dayNumber}/sections`,
  ADMIN_UPLOAD: '/api/admin/upload',
  ADMIN_MEDIA_CONFIG: (mediaId: string) => `/api/admin/media/${mediaId}`,
  
  // Health
  HEALTH: '/health'
} as const;

// Section Type Options
export const SECTION_TYPES = [
  { value: 'title', label: 'Title', icon: '📝' },
  { value: 'text', label: 'Text', icon: '📄' },
  { value: 'quote', label: 'Quote', icon: '💬' },
  { value: 'image', label: 'Image', icon: '🖼️' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'audio', label: 'Audio', icon: '🎵' },
  { value: 'divider', label: 'Divider', icon: '➖' },
] as const; 