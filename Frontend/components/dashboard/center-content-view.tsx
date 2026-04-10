"use client"

import NextImage from "next/image"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Upload, ImageIcon, FileText, Trash2 } from "lucide-react"
import { CONTENT_TYPES, type ContentType } from "@/lib/constants"

interface ContentBlock {
  id: string
  key: string
  type: ContentType
  title: string
  body: string
  imageUrl?: string
  isPublished: boolean
}

// Mock data
const initialContent: ContentBlock[] = [
  {
    id: "1",
    key: "home-hero",
    type: "hero",
    title: "Find Your Inner Peace",
    body: "Welcome to Serenity Center, where your journey to mindfulness and self-discovery begins. Our experienced practitioners guide you through meditation, intimacy coaching, and personal growth.",
    imageUrl: "/placeholder.svg?height=200&width=400",
    isPublished: true,
  },
  {
    id: "2",
    key: "about-section",
    type: "section",
    title: "Our Approach",
    body: "We blend ancient wisdom with modern techniques to create a holistic healing experience. Each session is tailored to your unique needs and goals.",
    isPublished: true,
  },
  {
    id: "3",
    key: "meditation-gallery",
    type: "gallery",
    title: "Our Meditation Spaces",
    body: "Explore our tranquil environments designed for deep reflection and peaceful practice.",
    imageUrl: "/placeholder.svg?height=200&width=400",
    isPublished: false,
  },
  {
    id: "4",
    key: "services-intro",
    type: "generic",
    title: "Services We Offer",
    body: "From guided meditation sessions to intimacy coaching for couples, we provide a range of services to support your personal growth journey.",
    isPublished: true,
  },
]

const typeColors: Record<ContentType, string> = {
  hero: "bg-primary/10 text-primary border-primary/20",
  section: "bg-accent/10 text-accent border-accent/20",
  facility: "bg-sky-100 text-sky-700 border-sky-200",
  gallery: "bg-amber-100 text-amber-700 border-amber-200",
  contact: "bg-rose-100 text-rose-700 border-rose-200",
  generic: "bg-secondary text-foreground border-border",
}

export function CenterContentView() {
  const [content, setContent] = useState<ContentBlock[]>(initialContent)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newContent, setNewContent] = useState<Omit<ContentBlock, "id">>({
    key: "",
    type: "generic",
    title: "",
    body: "",
    imageUrl: "",
    isPublished: false,
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Mock file upload - in production, this would upload to Cloudinary
      setNewContent({
        ...newContent,
        imageUrl: "/placeholder.svg?height=200&width=400",
      })
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Mock file upload
      setNewContent({
        ...newContent,
        imageUrl: "/placeholder.svg?height=200&width=400",
      })
    }
  }

  const handleAddContent = () => {
    if (newContent.key && newContent.title) {
      const contentBlock: ContentBlock = {
        id: String(Date.now()),
        ...newContent,
      }
      setContent([...content, contentBlock])
      setNewContent({
        key: "",
        type: "generic",
        title: "",
        body: "",
        imageUrl: "",
        isPublished: false,
      })
      setIsDialogOpen(false)
    }
  }

  const handleTogglePublish = (id: string) => {
    setContent(
      content.map((c) =>
        c.id === id ? { ...c, isPublished: !c.isPublished } : c
      )
    )
  }

  const handleDelete = (id: string) => {
    setContent(content.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
            Center Content
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage website content blocks and media
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-foreground">Add Content Block</DialogTitle>
              <DialogDescription>
                Create a new content block for the website
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-key" className="text-foreground">Key</Label>
                  <Input
                    id="content-key"
                    placeholder="e.g., home-hero"
                    value={newContent.key}
                    onChange={(e) => setNewContent({ ...newContent, key: e.target.value })}
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-type" className="text-foreground">Type</Label>
                  <Select
                    value={newContent.type}
                    onValueChange={(value) => setNewContent({ ...newContent, type: value as ContentType })}
                  >
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CONTENT_TYPES.HERO}>Hero</SelectItem>
                      <SelectItem value={CONTENT_TYPES.SECTION}>Section</SelectItem>
                      <SelectItem value={CONTENT_TYPES.GALLERY}>Gallery</SelectItem>
                      <SelectItem value={CONTENT_TYPES.GENERIC}>Generic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-title" className="text-foreground">Title</Label>
                <Input
                  id="content-title"
                  placeholder="Content title"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  className="bg-card border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-body" className="text-foreground">Body</Label>
                <Textarea
                  id="content-body"
                  placeholder="Content body text..."
                  value={newContent.body}
                  onChange={(e) => setNewContent({ ...newContent, body: e.target.value })}
                  className="bg-card border-border min-h-[120px]"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-foreground">Image (optional)</Label>
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                    ${newContent.imageUrl ? "bg-secondary/30" : ""}
                  `}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleFileSelect}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {newContent.imageUrl ? (
                    <div className="space-y-2">
                      <ImageIcon className="w-8 h-8 mx-auto text-primary" />
                      <p className="text-sm text-foreground">Image selected</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          setNewContent({ ...newContent, imageUrl: "" })
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop an image here, or click to select
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="published-toggle" className="text-foreground">Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this content visible on the website
                  </p>
                </div>
                <Switch
                  id="published-toggle"
                  checked={newContent.isPublished}
                  onCheckedChange={(checked) => setNewContent({ ...newContent, isPublished: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddContent} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Content
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Total Blocks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{content.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Published</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-600">
              {content.filter((c) => c.isPublished).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-600">
              {content.filter((c) => !c.isPublished).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>With Images</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">
              {content.filter((c) => c.imageUrl).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {content.map((block) => (
          <Card key={block.id} className="bg-card border-border/50 overflow-hidden group">
            {/* Image Preview */}
            {block.imageUrl && (
              <div className="aspect-video bg-secondary/30 relative overflow-hidden">
                <NextImage
                  src={block.imageUrl}
                  alt={block.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={`capitalize text-xs ${typeColors[block.type]}`}>
                      {block.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        block.isPublished
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-secondary text-muted-foreground border-border"
                      }
                    >
                      {block.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-medium text-foreground truncate">
                    {block.title}
                  </CardTitle>
                  <CardDescription className="text-xs font-mono">
                    {block.key}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {block.body}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={block.isPublished}
                    onCheckedChange={() => handleTogglePublish(block.id)}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <span className="text-xs text-muted-foreground">
                    {block.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(block.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {content.length === 0 && (
        <Card className="bg-card border-border/50">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No content yet</h3>
            <p className="text-muted-foreground mb-4">
              Start creating content blocks for your website
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Content
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
