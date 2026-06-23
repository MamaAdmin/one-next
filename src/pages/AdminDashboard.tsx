import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ArticleManagerEnhanced from "@/components/admin/ArticleManagerEnhanced";
import MediaManager from "@/components/admin/MediaManager";
import PageContentManager from "@/components/admin/PageContentManager";
import FAQManager from "@/components/admin/FAQManager";
import NavigationManager from "@/components/admin/NavigationManager";
import { RedirectManager } from "@/components/admin/RedirectManager";
import { PageTemplateManager } from "@/components/admin/PageTemplateManager";
import BMADInvitationManager from "@/components/admin/BMADInvitationManager";
import UserRoleManager from "@/components/admin/UserRoleManager";
import { 
  BMADSessionIcon, 
  BMADArtifactIcon, 
  BMADAnalyticsIcon,
  DocumentIcon,
  GridIcon,
  LayersIcon,
  MessageIcon,
  CompassIcon,
  LinkIcon
} from "@/components/ui/custom-icons";
import { FileText, UserPlus } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdmin();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'cms';
  const [cmsSection, setCmsSection] = useState<string>('articles');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">Admin-Dashboard</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Website-Inhalte, Blog-Artikel und Medien.
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cms">CMS</TabsTrigger>
              <TabsTrigger value="lms">LMS</TabsTrigger>
              <TabsTrigger value="bmad">BMAD</TabsTrigger>
              <TabsTrigger value="users">Benutzer</TabsTrigger>
            </TabsList>

            <TabsContent value="cms">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management System</CardTitle>
                  <CardDescription>
                    Verwalten Sie alle Inhalte: Artikel, Medien, Seiten, Navigation und SEO
                  </CardDescription>
                </CardHeader>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <Button 
                      variant="outline" 
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => setCmsSection('articles')}
                    >
                      <DocumentIcon className="w-14 h-14 text-primary" />
                      <span>Artikel</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => setCmsSection('media')}
                    >
                      <GridIcon className="w-14 h-14 text-primary" />
                      <span>Medien</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => setCmsSection('pages')}
                    >
                      <LayersIcon className="w-14 h-14 text-primary" />
                      <span>Seiteninhalte</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => setCmsSection('faq')}
                    >
                      <MessageIcon className="w-14 h-14 text-primary" />
                      <span>FAQ</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => setCmsSection('navigation')}
                    >
                      <CompassIcon className="w-14 h-14 text-primary" />
                      <span>Navigation</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => setCmsSection('page-templates')}
                    >
                      <FileText className="w-14 h-14 text-primary" />
                      <span>Seiten-Templates</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full h-24 flex flex-col items-center justify-center gap-2"
                      onClick={() => setCmsSection('seo')}
                    >
                      <LinkIcon className="w-14 h-14 text-primary" />
                      <span>SEO & Redirects</span>
                    </Button>
                  </div>

                  {cmsSection === 'articles' && <ArticleManagerEnhanced />}
                  {cmsSection === 'media' && <MediaManager />}
                  {cmsSection === 'pages' && <PageContentManager />}
                  {cmsSection === 'faq' && <FAQManager />}
                  {cmsSection === 'navigation' && <NavigationManager />}
                  {cmsSection === 'page-templates' && <PageTemplateManager />}
                  {cmsSection === 'seo' && <RedirectManager />}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="lms">
              <Card>
                <CardHeader>
                  <CardTitle>LMS Verwaltung</CardTitle>
                  <CardDescription>Verwalten Sie Kunden, Kurse, Käufe und Teilnehmer</CardDescription>
                </CardHeader>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Link to="/admin/lms">
                      <Button variant="outline" className="w-full h-20">Kunden</Button>
                    </Link>
                    <Link to="/admin/lms/courses">
                      <Button variant="outline" className="w-full h-20">Kurse</Button>
                    </Link>
                    <Link to="/admin/lms/modules">
                      <Button variant="outline" className="w-full h-20">Module</Button>
                    </Link>
                    <Link to="/admin/lms/toolbox">
                      <Button variant="outline" className="w-full h-20">Toolbox</Button>
                    </Link>
                    <Link to="/admin/lms/purchases">
                      <Button variant="outline" className="w-full h-20">Käufe</Button>
                    </Link>
                    <Link to="/admin/lms/enrollments">
                      <Button variant="outline" className="w-full h-20">Teilnahmen</Button>
                    </Link>
                    <Link to="/admin/lms/participants">
                      <Button variant="outline" className="w-full h-20">Teilnehmer</Button>
                    </Link>
                    <Link to="/admin/lms/analytics">
                      <Button variant="outline" className="w-full h-20">Analytik</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="bmad">
              <Card>
                <CardHeader>
                  <CardTitle>BMAD Verwaltung</CardTitle>
                  <CardDescription>
                    Breakthrough Method for Agile AI-Driven Development - Verwalten Sie AI-gestützte Entwicklungssessions
                  </CardDescription>
                </CardHeader>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Link to="/admin/bmad/sessions">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                        <BMADSessionIcon className="w-14 h-14 text-primary" />
                        <span>BMAD Sessions</span>
                      </Button>
                    </Link>
                    <Link to="/admin/bmad/artifacts">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                        <BMADArtifactIcon className="w-14 h-14 text-primary" />
                        <span>BMAD Artifacts</span>
                      </Button>
                    </Link>
                    <Link to="/admin/bmad/analytics">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                        <BMADAnalyticsIcon className="w-14 h-14 text-primary" />
                        <span>BMAD Analytics</span>
                      </Button>
                    </Link>
                    <Link to="/bmad">
                      <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                        <UserPlus className="w-8 h-8 text-primary" />
                        <span>BMAD Portal</span>
                      </Button>
                    </Link>
                  </div>
                  <BMADInvitationManager />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <UserRoleManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
