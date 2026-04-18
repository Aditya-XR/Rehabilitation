
import { useCallback, useEffect, useRef, useState } from "react"
import {
  FileText,
  ImageIcon,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react"

import { contentApi } from "@/lib/api"
import { CONTENT_TYPES } from "@/lib/constants"
import {
  contentTypeClasses,
  getPrimaryContentImage,
  hasContactInfo,
} from "@/lib/dashboard"
import { getRequestErrorMessage } from "@/lib/request"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const defaultFormState = {
  key: "",
  type: CONTENT_TYPES.GENERIC,
  title: "",
  body: "",
  isPublished: false,
  contactInfo: {},
}

const sortContent = (items) =>
  [...items].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )

export function CenterContentView() {
  const fileInputRef = useRef(null)

  const [content, setContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [replaceImages, setReplaceImages] = useState(false)
  const [togglingContentId, setTogglingContentId] = useState(null)
  const [deletingContentId, setDeletingContentId] = useState(null)
  const [formState, setFormState] = useState(defaultFormState)

  const loadContent = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await contentApi.listAdmin({ limit: 100 })
      setContent(sortContent(response.items))
      setError(null)
    } catch (error) {
      setError(getRequestErrorMessage(error, "Unable to load content blocks."))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadContent()
  }, [loadContent])

  const openCreateDialog = () => {
    setEditingContent(null)
    setSelectedFiles([])
    setReplaceImages(false)
    setFormState(defaultFormState)
    setIsDialogOpen(true)
  }

  const openEditDialog = (item) => {
    setEditingContent(item)
    setSelectedFiles([])
    setReplaceImages(false)
    setFormState({
      key: item.key,
      type: item.type,
      title: item.title,
      body: item.body,
      isPublished: item.isPublished,
      contactInfo: item.contactInfo || {},
    })
    setIsDialogOpen(true)
  }

  const resetDialog = () => {
    setEditingContent(null)
    setSelectedFiles([])
    setReplaceImages(false)
    setFormState(defaultFormState)
    setIsDialogOpen(false)
  }

  const setContactField = (field, value) => {
    setFormState((current) => ({
      ...current,
      contactInfo: {
        ...current.contactInfo,
        [field]: value,
      },
    }))
  }

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files ?? []))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const payload = {
        key: formState.key,
        type: formState.type,
        title: formState.title,
        body: formState.body,
        isPublished: formState.isPublished,
        contactInfo: hasContactInfo(formState.contactInfo)
          ? formState.contactInfo
          : undefined,
        images: selectedFiles,
      }

      if (editingContent) {
        const response = await contentApi.update(editingContent._id, {
          ...payload,
          replaceImages,
        })
        setContent((current) =>
          sortContent(
            current.map((item) =>
              item._id === editingContent._id ? response.content : item,
            ),
          ),
        )
        toast({
          title: "Content updated",
          description: `${response.content.key} is now synced with the backend.`,
        })
      } else {
        const response = await contentApi.create(payload)
        setContent((current) => sortContent([...current, response.content]))
        toast({
          title: "Content created",
          description: `${response.content.key} h added successfully.`,
        })
      }

      setError(null)
      resetDialog()
    } catch (error) {
      toast({
        title: "Save failed",
        description: getRequestErrorMessage(error, "Unable to save this content block."),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTogglePublish = async (item, checked) => {
    try {
      setTogglingContentId(item._id)
      const response = await contentApi.update(item._id, { isPublished: checked })
      setContent((current) =>
        sortContent(
          current.map((entry) =>
            entry._id === item._id ? response.content : entry,
          ),
        ),
      )
      toast({
        title: checked ? "Content published" : "Content moved to draft",
        description: `${item.key} w successfully.`,
      })
    } catch (error) {
      toast({
        title: "Publish update failed",
        description: getRequestErrorMessage(error, "Unable to update publish status."),
        variant: "destructive",
      })
    } finally {
      setTogglingContentId(null)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete content block "${item.key}"?`)) {
      return
    }

    try {
      setDeletingContentId(item._id)
      await contentApi.remove(item._id)
      setContent((current) => current.filter((entry) => entry._id !== item._id))
      toast({
        title: "Content deleted",
        description: `${item.key} w successfully.`,
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getRequestErrorMessage(error, "Unable to delete this content block."),
        variant: "destructive",
      })
    } finally {
      setDeletingContentId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
            Center Content
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage published content and media blocks shown throughout the user portal
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="gap-2" onClick={() => void loadContent()}>
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                resetDialog()
                return
              }

              setIsDialogOpen(true)
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={openCreateDialog}
              >
                <Plus className="w-4 h-4" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-foreground">
                  {editingContent ? "Edit Content Block" : "Add Content Block"}
                </DialogTitle>
                <DialogDescription>
                  Create or update published content using the backend content API.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="content-key" className="text-foreground">
                      Key
                    </Label>
                    <Input
                      id="content-key"
                      placeholder="home-hero"
                      value={formState.key}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          key: event.target.value,
                        }))
                      }
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content-type" className="text-foreground">
                      Type
                    </Label>
                    <Select
                      value={formState.type}
                      onValueChange={(value) =>
                        setFormState((current) => ({
                          ...current,
                          type: value ,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={CONTENT_TYPES.HERO}>Hero</SelectItem>
                        <SelectItem value={CONTENT_TYPES.SECTION}>Section</SelectItem>
                        <SelectItem value={CONTENT_TYPES.FACILITY}>Facility</SelectItem>
                        <SelectItem value={CONTENT_TYPES.GALLERY}>Gallery</SelectItem>
                        <SelectItem value={CONTENT_TYPES.CONTACT}>Contact</SelectItem>
                        <SelectItem value={CONTENT_TYPES.GENERIC}>Generic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-title" className="text-foreground">
                    Title
                  </Label>
                  <Input
                    id="content-title"
                    placeholder="Optional section title"
                    value={formState.title}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    className="bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-body" className="text-foreground">
                    Body
                  </Label>
                  <Textarea
                    id="content-body"
                    placeholder="Describe this content block..."
                    value={formState.body}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        body: event.target.value,
                      }))
                    }
                    className="bg-card border-border min-h-[120px]"
                  />
                </div>

                <div className="rounded-lg border border-border p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Contact Details</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Optional fields for contact-style content blocks.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={formState.contactInfo.email || ""}
                        onChange={(event) =>
                          setContactField("email", event.target.value)
                        }
                        className="bg-card border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone</Label>
                      <Input
                        id="contact-phone"
                        value={formState.contactInfo.phone || ""}
                        onChange={(event) =>
                          setContactField("phone", event.target.value)
                        }
                        className="bg-card border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-website">Website</Label>
                      <Input
                        id="contact-website"
                        value={formState.contactInfo.website || ""}
                        onChange={(event) =>
                          setContactField("website", event.target.value)
                        }
                        className="bg-card border-border"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="contact-address">Address</Label>
                      <Input
                        id="contact-address"
                        value={formState.contactInfo.address || ""}
                        onChange={(event) =>
                          setContactField("address", event.target.value)
                        }
                        className="bg-card border-border"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Images</Label>
                  <button
                    type="button"
                    className="w-full rounded-lg border-2 border-dashed border-border px-4 py-6 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex items-start gap-3">
                      <Upload className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {selectedFiles.length > 0
                            ? `${selectedFiles.length} file(s) selected`
                            : "Upload content images"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, or WEBP up to 5 MB each.
                        </p>
                        {selectedFiles.length > 0 ? (
                          <div className="pt-2 space-y-1">
                            {selectedFiles.map((file) => (
                              <p
                                key={`${file.name}-${file.lastModified}`}
                                className="text-xs text-muted-foreground"
                              >
                                {file.name}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </div>

                {editingContent ? (
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="replace-images" className="text-foreground">
                        Replace Existing Images
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Turn this on to replace old media instead of appending new uploads.
                      </p>
                    </div>
                    <Switch
                      id="replace-images"
                      checked={replaceImages}
                      onCheckedChange={setReplaceImages}
                    />
                  </div>
                ) : null}

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="published-toggle" className="text-foreground">
                      Published
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Make this content visible to users immediately.
                    </p>
                  </div>
                  <Switch
                    id="published-toggle"
                    checked={formState.isPublished}
                    onCheckedChange={(checked) =>
                      setFormState((current) => ({
                        ...current,
                        isPublished: checked,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetDialog} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleSubmit()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner className="mr-2" /> : null}
                  {editingContent ? "Save Changes" : "Add Content"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load content</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

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
              {content.filter((item) => item.isPublished).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-amber-600">
              {content.filter((item) => !item.isPublished).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>With Images</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">
              {content.filter((item) => item.images.length > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="py-16 flex items-center justify-center">
          <Spinner className="text-primary" />
        </div>
      ) : content.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="py-16">
            <Empty className="border-border/60">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No content yet</EmptyTitle>
                <EmptyDescription>
                  Create the first content block that will feed the user-facing portal.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={openCreateDialog} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Content
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.map((item) => {
            const imageUrl = getPrimaryContentImage(item)
            const isDeleting = deletingContentId === item._id
            const isToggling = togglingContentId === item._id

            return (
              <Card
                key={item._id}
                className="bg-card border-border/50 overflow-hidden group"
              >
                {imageUrl ? (
                  <div className="aspect-video bg-secondary/30 relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.title || item.key}
                      className="object-cover w-full h-full absolute inset-0"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary/30 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/60" />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs ${contentTypeClasses[item.type]}`}
                        >
                          {item.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            item.isPublished
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-secondary text-muted-foreground border-border"
                          }
                        >
                          {item.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-medium text-foreground truncate">
                        {item.title || item.key}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono">
                        {item.key}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[60px]">
                    {item.body || "No body copy h added yet."}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.images.length} image(s)</span>
                    {hasContactInfo(item.contactInfo) ? <span>Contact details added</span> : null}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isPublished}
                        onCheckedChange={(checked) =>
                          void handleTogglePublish(item, checked)
                        }
                        disabled={isToggling}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                      <span className="text-xs text-muted-foreground">
                        {isToggling
                          ? "Saving..."
                          : item.isPublished
                            ? "Published"
                            : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => void handleDelete(item)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Spinner /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
