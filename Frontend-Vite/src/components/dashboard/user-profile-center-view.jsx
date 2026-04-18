
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Globe,
  ImageIcon,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Upload,
} from "lucide-react"

import { authApi, contentApi } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import {
  contentTypeClasses,
  getInitials,
  getPrimaryContentImage,
  groupPublishedContent,
  hasContactInfo,
} from "@/lib/dashboard"
import { getRequestErrorMessage } from "@/lib/request"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

export function UserProfileCenterView() {
  const fileInputRef = useRef(null)
  const { user, syncUser } = useAuth()

  const [name, setName] = useState(user?.name || "")
  const [selectedFile, setSelectedFile] = useState(null)
  const [contentItems, setContentItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [meResponse, contentResponse] = await Promise.all([
        authApi.getCurrentUser(),
        contentApi.listPublic({ limit: 100 }),
      ])

      syncUser(meResponse.user)
      setName(meResponse.user.name)
      setContentItems(contentResponse.items)
      setError(null)
    } catch (error) {
      setError(getRequestErrorMessage(error, "Unable to load your profile details."))
    } finally {
      setIsLoading(false)
    }
  }, [syncUser])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await authApi.updateProfile({
        name,
        avatarFile: selectedFile ?? undefined,
      })
      syncUser(response.user)
      setName(response.user.name)
      setSelectedFile(null)
      toast({
        title: "Profile updated",
        description: "Your profile details are now synced with the backend.",
      })
      setError(null)
    } catch (error) {
      toast({
        title: "Update failed",
        description: getRequestErrorMessage(error, "Unable to update your profile."),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const groupedContent = groupPublishedContent(contentItems)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
            Profile & Center Info
          </h2>
          <p className="text-muted-foreground mt-1">
            Update your profile and browse the latest published center content
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => void loadData()}>
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load your portal details</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="py-16 flex items-center justify-center">
          <Spinner className="text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.1fr_1.4fr]">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-foreground">Your Profile</CardTitle>
                <CardDescription>
                  These details come from your authenticated user record.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-2 border-border">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-lg font-medium text-foreground">
                      {user?.name || "User"}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge variant="outline" className="capitalize">
                      {user?.role || "user"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="bg-card border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Profile Picture</Label>
                  <button
                    type="button"
                    className="w-full rounded-lg border-2 border-dashed border-border px-4 py-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        setSelectedFile(event.target.files?.[0] ?? null)
                      }
                    />
                    <div className="flex items-start gap-3">
                      <Upload className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {selectedFile ? selectedFile.name : "Choose a new avatar"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Upload a JPG, PNG, or WEBP image up to 5 MB.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                >
                  {isSaving ? <Spinner className="mr-2" /> : null}
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-foreground">Center Snapshot</CardTitle>
                <CardDescription>
                  A quick overview of the currently published content.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Published blocks</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {contentItems.length}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">With media</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {contentItems.filter((item) => item.images.length > 0).length}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Contact blocks</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {
                      contentItems.filter((item) => hasContactInfo(item.contactInfo)).length
                    }
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Hero sections</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">
                    {contentItems.filter((item) => item.type === "hero").length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {groupedContent.map((group) => (
              <section key={group.type} className="space-y-4">
                <div>
                  <h3 className="text-xl font-serif font-semibold text-foreground">
                    {group.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Published content sourced directly from the backend.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((item) => {
                    const imageUrl = getPrimaryContentImage(item)

                    return (
                      <Card key={item._id} className="bg-card border-border/50 overflow-hidden">
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
                            <div className="space-y-1">
                              <Badge
                                variant="outline"
                                className={`capitalize ${contentTypeClasses[item.type]}`}
                            >
                              {item.type}
                              </Badge>
                              <CardTitle className="text-base font-medium text-foreground">
                                {item.title || item.key}
                              </CardTitle>
                              <CardDescription className="font-mono text-xs">
                                {item.key}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 min-h-[84px]">
                            {item.body || "No body copy h added for this section yet."}
                          </p>
                          {hasContactInfo(item.contactInfo) ? (
                            <div className="space-y-2 text-sm">
                              {item.contactInfo.email ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="w-4 h-4 text-primary" />
                                  <span>{item.contactInfo.email}</span>
                                </div>
                              ) : null}
                              {item.contactInfo.phone ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="w-4 h-4 text-primary" />
                                  <span>{item.contactInfo.phone}</span>
                                </div>
                              ) : null}
                              {item.contactInfo.address ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  <span>{item.contactInfo.address}</span>
                                </div>
                              ) : null}
                              {item.contactInfo.website ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Globe className="w-4 h-4 text-primary" />
                                  <span>{item.contactInfo.website}</span>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
