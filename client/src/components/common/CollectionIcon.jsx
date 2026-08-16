import {
  Folder,
  Cloud,
  Settings,
  Palette,
  Zap,
  Star,
  Heart,
  Gem,
  Smartphone,
  Book,
  Camera,
  Video,
  Music,
  ShoppingBag,
  Gamepad2,
  Globe,
  Code,
  Layout,
  FileText,
  Bookmark,
  Sparkles,
  Target,
  Box,
  Compass,
  Smile,
  Shield,
  Feather
} from 'lucide-react'

export const COLLECTION_ICONS = [
  { id: 'folder', name: 'Folder', icon: Folder, defaultColor: '#3b82f6' },
  { id: 'cloud', name: 'Cloud', icon: Cloud, defaultColor: '#3b82f6' },
  { id: 'settings', name: 'Settings', icon: Settings, defaultColor: '#6b7280' },
  { id: 'palette', name: 'Design', icon: Palette, defaultColor: '#ec4899' },
  { id: 'zap', name: 'Inspiration', icon: Zap, defaultColor: '#f59e0b' },
  { id: 'star', name: 'Star', icon: Star, defaultColor: '#eab308' },
  { id: 'heart', name: 'Heart', icon: Heart, defaultColor: '#ef4444' },
  { id: 'gem', name: 'Gem', icon: Gem, defaultColor: '#f43f5e' },
  { id: 'smartphone', name: 'Apps', icon: Smartphone, defaultColor: '#06b6d4' },
  { id: 'book', name: 'Articles', icon: Book, defaultColor: '#8b5cf6' },
  { id: 'camera', name: 'Photos', icon: Camera, defaultColor: '#10b981' },
  { id: 'video', name: 'Video', icon: Video, defaultColor: '#3b82f6' },
  { id: 'music', name: 'Music', icon: Music, defaultColor: '#f97316' },
  { id: 'shopping-bag', name: 'Shopping', icon: ShoppingBag, defaultColor: '#14b8a6' },
  { id: 'gamepad', name: 'Gaming', icon: Gamepad2, defaultColor: '#8b5cf6' },
  { id: 'globe', name: 'Web', icon: Globe, defaultColor: '#0ea5e9' },
  { id: 'code', name: 'Development', icon: Code, defaultColor: '#6366f1' },
  { id: 'layout', name: 'Prototyping', icon: Layout, defaultColor: '#10b981' },
  { id: 'file-text', name: 'Documents', icon: FileText, defaultColor: '#64748b' },
  { id: 'bookmark', name: 'Bookmarks', icon: Bookmark, defaultColor: '#e11d48' },
  { id: 'sparkles', name: 'AI & Tools', icon: Sparkles, defaultColor: '#a855f7' },
  { id: 'target', name: 'Target', icon: Target, defaultColor: '#f43f5e' },
  { id: 'box', name: 'Freebies', icon: Box, defaultColor: '#eab308' },
  { id: 'compass', name: 'Explore', icon: Compass, defaultColor: '#06b6d4' }
]

export const RAINDROP_COLORS = [
  '#eb4d4b', // Coral / Red
  '#f0932b', // Orange / Amber
  '#f6e58d', // Yellow
  '#6ab04c', // Green / Emerald
  '#22a6b3', // Teal / Cyan
  '#4834d4', // Deep Blue
  '#686de0', // Indigo
  '#be2edd', // Purple
  '#30336b', // Navy
  '#535c68'  // Gray
]

export default function CollectionIcon({ icon, color, className = 'w-4 h-4' }) {
  const match = COLLECTION_ICONS.find(i => i.id === icon)
  const IconComponent = match ? match.icon : Folder
  const finalColor = color || match?.defaultColor || '#3b82f6'

  return <IconComponent className={className} style={{ color: finalColor }} />
}
