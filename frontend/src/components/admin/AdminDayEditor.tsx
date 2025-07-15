import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminCountdownDay } from '../../hooks/useAdminCountdown';
import { adminApi } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  EyeIcon, 
  CheckIcon, 
  XMarkIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrashIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  DaySection,
  DaySectionCreate,
  MediaAsset,
  AudioConfig,
  MediaConfig,
  SECTION_TYPES,
  SectionStyleConfig
} from '../../types';

const AdminDayEditor: React.FC = () => {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const dayNum = parseInt(dayNumber || '0', 10);
  
  const { day, loading, error, updateDay, refetch } = useAdminCountdownDay(dayNum);
  
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<DaySection[]>([]);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    autoplay: false,
    loop: false,
    volume: 0.7,
    background_mode: false,
    fade_on_video: true,
    video_volume_ratio: 0.3
  });
  const [backgroundAudioId, setBackgroundAudioId] = useState<string | undefined>();
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<MediaAsset[]>([]);

  // Initialize form when day data loads
  useEffect(() => {
    if (day) {
      setTitle(day.title);
      setSections(day.sections || []);
      setAudioConfig(day.audio_config || {
        autoplay: false,
        loop: false,
        volume: 0.7,
        background_mode: false,
        fade_on_video: true,
        video_volume_ratio: 0.3
      });
      setBackgroundAudioId(day.background_audio_id);
      setAvailableMedia(day.media_assets || []);
      setHasChanges(false);
    }
  }, [day]);

  // Track changes
  useEffect(() => {
    if (day) {
      const titleChanged = title !== day.title;
      const sectionsChanged = JSON.stringify(sections) !== JSON.stringify(day.sections || []);
      const audioChanged = JSON.stringify(audioConfig) !== JSON.stringify(day.audio_config || {});
      const bgAudioChanged = backgroundAudioId !== day.background_audio_id;
      setHasChanges(titleChanged || sectionsChanged || audioChanged || bgAudioChanged);
    }
  }, [title, sections, audioConfig, backgroundAudioId, day]);

  // Add new section
  const addSection = (type: string) => {
    const newSection: DaySection = {
      id: `temp-${Date.now()}`,
      day_number: dayNum,
      section_type: type as any,
      content_text: '',
      position_order: sections.length,
      style_config: {
        alignment: 'left',
        font_size: 'medium',
        margin: 'normal'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setSections([...sections, newSection]);
  };

  // Update section
  const updateSection = (sectionId: string, updates: Partial<DaySection>) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, ...updates, updated_at: new Date().toISOString() }
        : section
    ));
  };

  // Delete section
  const deleteSection = (sectionId: string) => {
    const newSections = sections.filter(s => s.id !== sectionId);
    // Reorder positions
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      position_order: index
    }));
    setSections(reorderedSections);
  };

  // Move section
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
    
    // Update position orders
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      position_order: index
    }));
    
    setSections(reorderedSections);
  };

  // Upload media
  const uploadMedia = async (file: File, mediaConfig?: MediaConfig) => {
    setIsUploading(true);
    try {
      const response = await adminApi.uploadMedia(file, dayNum, mediaConfig);
      setAvailableMedia([...availableMedia, response]);
      toast.success(`${file.type.startsWith('image') ? 'Image' : file.type.startsWith('video') ? 'Video' : 'Audio'} uploaded successfully!`);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle media upload for section
  const handleSectionMediaUpload = async (sectionId: string, file: File) => {
    try {
      const mediaConfig: MediaConfig = {
        controls: true,
        autoplay: false,
        volume: 1.0
      };

      if (file.type.startsWith('audio/')) {
        mediaConfig.background_mode = false; // Default to interactive for section audio
      }

      const response = await uploadMedia(file, mediaConfig);
      updateSection(sectionId, { media_asset_id: response.id, media_asset: response });
    } catch (err) {
      // Error already handled in uploadMedia
    }
  };

  // Save all changes
  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      // Convert sections to create format
      const sectionsToSave: DaySectionCreate[] = sections.map(section => ({
        day_number: dayNum,
        section_type: section.section_type,
        content_text: section.content_text,
        position_order: section.position_order,
        style_config: section.style_config,
        media_asset_id: section.media_asset_id
      }));

      // Update sections
      await adminApi.updateDaySections(dayNum, sectionsToSave);

      // Update day metadata
      await updateDay({ 
        title, 
        background_audio_id: backgroundAudioId,
        audio_config: audioConfig 
      });

      setHasChanges(false);
      toast.success('Day saved successfully!');
    } catch (err) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/admin/dashboard');
      }
    } else {
      navigate('/admin/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading editor..." />
      </div>
    );
  }

  if (error || !day) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-warm-gray-800 mb-4">
            Error Loading Day
          </h2>
          <p className="text-warm-gray-600 mb-6 max-w-md">
            {error || "Could not load the day for editing."}
          </p>
          <div className="space-x-4">
            <Link to="/admin/dashboard" className="btn-romantic">
              Back to Dashboard
            </Link>
            <button onClick={refetch} className="btn-outline">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const audioFiles = availableMedia.filter(m => m.mime_type.startsWith('audio/'));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-warm-gray-800">
            Edit Day {day.day_number}
          </h1>
          <p className="text-warm-gray-600 mt-2">
            Create beautiful sectioned content for this special day
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to={`/day/${day.day_number}?preview_token=vibeCoding2025!`}
            target="_blank"
            className="btn-outline"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Preview
          </Link>
          
          <button
            onClick={handleCancel}
            className="btn-outline"
          >
            <XMarkIcon className="w-4 h-4 mr-2" />
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="btn-romantic disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center space-x-4 mb-6">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          day.is_unlocked 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            day.is_unlocked ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          {day.is_unlocked ? 'Unlocked' : 'Locked'}
        </div>
        
        {hasChanges && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            Unsaved changes
          </div>
        )}
        
        {isUploading && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            <LoadingSpinner size="sm" />
            Uploading...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl shadow-lg border border-warm-gray-200 p-6">
            <label htmlFor="title" className="block text-sm font-medium text-warm-gray-700 mb-2">
              Day Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-romantic"
              placeholder="Enter a beautiful title for this day..."
              maxLength={255}
            />
            <p className="text-xs text-warm-gray-500 mt-1">
              {title.length}/255 characters
            </p>
          </div>

          {/* Sections */}
          <div className="bg-white rounded-xl shadow-lg border border-warm-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-warm-gray-800">Content Sections</h3>
              <div className="flex items-center space-x-2">
                {SECTION_TYPES.map(type => (
                  <button
                    key={type.value}
                    onClick={() => addSection(type.value)}
                    className="btn-soft text-xs"
                    title={`Add ${type.label}`}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-12 text-warm-gray-500">
                <PlusIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sections yet. Add your first section above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, index) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    onUpdate={(updates) => updateSection(section.id, updates)}
                    onDelete={() => deleteSection(section.id)}
                    onMoveUp={() => moveSection(section.id, 'up')}
                    onMoveDown={() => moveSection(section.id, 'down')}
                    onMediaUpload={(file) => handleSectionMediaUpload(section.id, file)}
                    canMoveUp={index > 0}
                    canMoveDown={index < sections.length - 1}
                    availableMedia={availableMedia}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Audio Configuration */}
          <div className="bg-white rounded-xl shadow-lg border border-warm-gray-200 p-6">
            <h3 className="text-lg font-medium text-warm-gray-800 mb-4">Audio Settings</h3>
            
            {/* Background Audio Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-warm-gray-700 mb-2">
                Background Audio
              </label>
              <select
                value={backgroundAudioId || ''}
                onChange={(e) => setBackgroundAudioId(e.target.value || undefined)}
                className="input-romantic"
              >
                <option value="">No background audio</option>
                {audioFiles.map(audio => (
                  <option key={audio.id} value={audio.id}>
                    {audio.filename}
                  </option>
                ))}
              </select>
            </div>

            {backgroundAudioId && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-warm-gray-700 mb-2">
                    Volume: {Math.round((audioConfig.volume || 0.7) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audioConfig.volume || 0.7}
                    onChange={(e) => setAudioConfig({
                      ...audioConfig,
                      volume: parseFloat(e.target.value)
                    })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoplay"
                    checked={audioConfig.autoplay || false}
                    onChange={(e) => setAudioConfig({
                      ...audioConfig,
                      autoplay: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="autoplay" className="text-sm text-warm-gray-700">
                    Autoplay on page load
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="loop"
                    checked={audioConfig.loop || false}
                    onChange={(e) => setAudioConfig({
                      ...audioConfig,
                      loop: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="loop" className="text-sm text-warm-gray-700">
                    Loop audio
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fade_on_video"
                    checked={audioConfig.fade_on_video !== false}
                    onChange={(e) => setAudioConfig({
                      ...audioConfig,
                      fade_on_video: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="fade_on_video" className="text-sm text-warm-gray-700">
                    Fade when video plays
                  </label>
                </div>

                {audioConfig.fade_on_video !== false && (
                  <div>
                    <label className="block text-sm font-medium text-warm-gray-700 mb-2">
                      Volume during video: {Math.round((audioConfig.video_volume_ratio || 0.3) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={audioConfig.video_volume_ratio || 0.3}
                      onChange={(e) => setAudioConfig({
                        ...audioConfig,
                        video_volume_ratio: parseFloat(e.target.value)
                      })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Media Library */}
          <div className="bg-white rounded-xl shadow-lg border border-warm-gray-200 p-6">
            <h3 className="text-lg font-medium text-warm-gray-800 mb-4">Media Library</h3>
            {availableMedia.length === 0 ? (
              <p className="text-sm text-warm-gray-500">No media uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {availableMedia.map(media => (
                  <div key={media.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-xs font-medium text-warm-gray-800 truncate">
                        {media.filename}
                      </p>
                      <p className="text-xs text-warm-gray-500">
                        {media.mime_type.split('/')[0]}
                      </p>
                    </div>
                    <div className="text-xs text-warm-gray-500">
                      {(media.file_size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save reminder */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-warm-orange text-white px-6 py-3 rounded-full shadow-warm animate-bounce-gentle">
          <span className="text-sm font-medium">Don't forget to save your changes!</span>
        </div>
      )}
    </div>
  );
};

// Section Editor Component
interface SectionEditorProps {
  section: DaySection;
  onUpdate: (updates: Partial<DaySection>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMediaUpload: (file: File) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  availableMedia: MediaAsset[];
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMediaUpload,
  canMoveUp,
  canMoveDown,
  availableMedia
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const sectionType = SECTION_TYPES.find(t => t.value === section.section_type);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onMediaUpload(file);
    }
  };

  const renderSectionContent = () => {
    switch (section.section_type) {
      case 'title':
      case 'text':
      case 'quote':
        return (
          <textarea
            value={section.content_text || ''}
            onChange={(e) => onUpdate({ content_text: e.target.value })}
            placeholder={`Enter ${section.section_type} content...`}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={section.section_type === 'title' ? 2 : 4}
          />
        );
      
      case 'image':
      case 'video':
      case 'audio':
        return (
          <div className="space-y-3">
            {section.media_asset ? (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">
                  {section.media_asset.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {section.media_asset.mime_type}
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  No {section.section_type} selected
                </p>
                <label className="btn-soft text-xs cursor-pointer">
                  Upload {section.section_type}
                  <input
                    type="file"
                    accept={section.section_type === 'image' ? 'image/*' : 
                           section.section_type === 'video' ? 'video/*' : 'audio/*'}
                    onChange={handleMediaSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            
            {section.content_text !== undefined && (
              <input
                type="text"
                value={section.content_text || ''}
                onChange={(e) => onUpdate({ content_text: e.target.value })}
                placeholder={`${section.section_type === 'image' ? 'Caption' : 'Description'}...`}
                className="w-full p-2 border border-gray-300 rounded"
              />
            )}
          </div>
        );
      
      case 'divider':
        return (
          <div className="text-center py-4 text-gray-500">
            <hr className="border-gray-300" />
            <p className="text-sm mt-2">Section Divider</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{sectionType?.icon}</span>
          <span className="font-medium text-gray-800">{sectionType?.label}</span>
          <span className="text-xs text-gray-500">#{section.position_order + 1}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Section Settings"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Move Up"
          >
            <ArrowUpIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            title="Move Down"
          >
            <ArrowDownIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Delete Section"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="mb-3 p-3 bg-gray-50 rounded border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Alignment</label>
              <select
                value={section.style_config?.alignment || 'left'}
                onChange={(e) => onUpdate({
                  style_config: {
                    ...section.style_config,
                    alignment: e.target.value as any
                  }
                })}
                className="w-full text-xs p-1 border border-gray-300 rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Size</label>
              <select
                value={section.style_config?.font_size || 'medium'}
                onChange={(e) => onUpdate({
                  style_config: {
                    ...section.style_config,
                    font_size: e.target.value as any
                  }
                })}
                className="w-full text-xs p-1 border border-gray-300 rounded"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {renderSectionContent()}
    </div>
  );
};

export default AdminDayEditor; 