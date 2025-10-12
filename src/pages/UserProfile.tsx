import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { AchievementsCard } from "@/components/profile/AchievementsCard";
import { CoursesCard } from "@/components/profile/CoursesCard";
import { LoadingScreen } from "@/components/profile/LoadingScreen";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEnrollmentsWithCourses } from "@/hooks/useEnrollmentsWithCourses";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { useCourseRatings } from "@/hooks/useCourseRatings";
import { supabase } from "@/integrations/supabase/client";

const UserProfile = () => {
  const navigate = useNavigate();
  const { profile, participant, loading: profileLoading, updateProfile, uploadAvatar, updateParticipantPhone } = useUserProfile();
  const { enrollments, loading: enrollmentsLoading } = useEnrollmentsWithCourses();
  const { achievements, streak, loading: achievementsLoading } = useUserAchievements(participant?.id);

  // Auth-Check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate("/auth");
    };
    checkAuth();
  }, [navigate]);

  // Loading State
  if (profileLoading || enrollmentsLoading || achievementsLoading) {
    return <LoadingScreen />;
  }

  // Error State
  if (!participant) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 pt-24 pb-16 px-4">
          <div className="container max-w-4xl mx-auto">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle>Kein Teilnehmer-Profil gefunden</CardTitle>
                <CardDescription>
                  Bitte kontaktieren Sie den Support.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.completed_at).length;
  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;

  const handleRatingSubmit = async (
    courseId: string,
    enrollmentId: string,
    rating: number,
    review?: string
  ) => {
    const { createRating } = useCourseRatings(courseId);
    await createRating(enrollmentId, rating, review);
  };

  const handleProfileUpdate = async (data: { full_name: string; phone: string }) => {
    await updateProfile({ full_name: data.full_name });
    if (data.phone !== participant?.phone) {
      await updateParticipantPhone(data.phone);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="container max-w-4xl mx-auto space-y-8">
          <ProfileHeader
            name={profile?.full_name}
            email={profile?.email}
            avatar={profile?.avatar_url}
          />

          <ProfileStats
            totalCourses={totalCourses}
            completedCourses={completedCourses}
            streak={streak}
            achievements={unlockedAchievements}
          />

          <div className="grid md:grid-cols-2 gap-6">
            <PersonalInfoCard
              fullName={profile?.full_name}
              email={profile?.email}
              phone={participant?.phone}
              onUpdate={handleProfileUpdate}
            />

            <Card>
              <CardHeader>
                <CardTitle>Profilbild</CardTitle>
                <CardDescription>
                  Laden Sie ein Bild hoch oder ändern Sie Ihr aktuelles Foto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  currentAvatar={profile?.avatar_url}
                  userName={profile?.full_name || undefined}
                  onUpload={uploadAvatar}
                />
              </CardContent>
            </Card>
          </div>

          <AchievementsCard achievements={achievements} />

          <CoursesCard
            enrollments={enrollments}
            onRatingSubmit={handleRatingSubmit}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
