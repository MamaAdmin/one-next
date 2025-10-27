import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCoursePurchase } from "@/hooks/useCoursePurchase";
import { Download, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const PurchaseHistory = () => {
  const { purchases, loading } = useCoursePurchase();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            Sie haben noch keine Kurse gekauft.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Bezahlt</Badge>;
      case 'pending':
        return <Badge variant="secondary">Ausstehend</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fehlgeschlagen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Kaufhistorie</h2>
        <p className="text-muted-foreground">Übersicht aller Ihrer Kurskäufe</p>
      </div>

      <div className="space-y-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{purchase.lms_courses?.title || 'Kurs'}</CardTitle>
                  <CardDescription>
                    Gekauft am {new Date(purchase.purchased_at).toLocaleDateString('de-DE')}
                  </CardDescription>
                </div>
                {getStatusBadge(purchase.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Lizenzen:</span>
                  <p className="font-medium">{purchase.licenses}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gesamtpreis:</span>
                  <p className="font-medium">CHF {purchase.price_chf?.toFixed(2)}</p>
                </div>
                {purchase.customers?.company_name && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Firma:</span>
                    <p className="font-medium">{purchase.customers.company_name}</p>
                  </div>
                )}
              </div>

              {purchase.status === 'paid' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Rechnung
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Zum Kurs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
