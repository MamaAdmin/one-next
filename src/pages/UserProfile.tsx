import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { CourseList } from "@/components/profile/CourseList";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { PurchaseHistory } from "@/components/profile/PurchaseHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLMSEnrollment } from "@/hooks/useLMSEnrollment";
import { useCourseRatings } from "@/hooks/useCourseRatings";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile, participant, loading: profileLoading, updateProfile, uploadAvatar, updateParticipantPhone } = useUserProfile();
  const { enrollments, loading: enrollmentsLoading } = useLMSEnrollment();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "profile");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (participant?.phone) {
      setPhone(participant.phone);
    }
  }, [profile, participant]);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      await updateProfile({ full_name: fullName });
      if (phone !== participant?.phone) {
        await updateParticipantPhone(phone);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleRatingSubmit = async (
    courseId: string,
    enrollmentId: string,
    rating: number,
    review?: string
  ) => {
    const { createRating } = useCourseRatings(courseId);
    await createRating(enrollmentId, rating, review);
  };

  if (profileLoading || enrollmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const courses = enrollments.map((enrollment: any) => ({
    id: enrollment.purchase?.course_id || "",
    title: enrollment.purchase?.course?.title || "Unbekannter Kurs",
    progress: enrollment.progress_percentage || 0,
    isCompleted: !!enrollment.completed_at,
    enrollmentId: enrollment.id,
    rating: undefined, // TODO: Load ratings
  }));

  const totalCourses = courses.length;
  const completedCourses = courses.filter((c: any) => c.isCompleted).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mein Profil</h1>
            <p className="text-muted-foreground">
              Verwalten Sie Ihre persönlichen Informationen und Kurse
            </p>
          </div>

          <ProfileStats
            totalCourses={totalCourses}
            completedCourses={completedCourses}
            streak={0}
            achievements={0}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="courses">Meine Kurse</TabsTrigger>
              <TabsTrigger value="purchases">Käufe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Persönliche Informationen</CardTitle>
                  <CardDescription>
                    Aktualisieren Sie Ihr Profilfoto und Ihre Daten
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AvatarUpload
                    currentAvatar={profile?.avatar_url}
                    userName={profile?.full_name || undefined}
                    onUpload={uploadAvatar}
                  />

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Vollständiger Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ihr Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-Mail-Adresse</Label>
                      <Input
                        id="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Die E-Mail-Adresse kann nicht geändert werden
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Telefonnummer"
                      />
                    </div>

                    <Button onClick={handleUpdateProfile} disabled={updating}>
                      {updating ? "Wird gespeichert..." : "Änderungen speichern"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Meine Kurse</CardTitle>
                  <CardDescription>
                    Ihre eingeschriebenen und abgeschlossenen Kurse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courses.length > 0 ? (
                    <CourseList courses={courses} onRatingSubmit={handleRatingSubmit} />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Sie sind noch in keinen Kursen eingeschrieben
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases">
              <PurchaseHistory />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
