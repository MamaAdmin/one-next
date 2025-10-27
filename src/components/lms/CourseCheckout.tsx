import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, CreditCard, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CourseCheckoutProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  customerId: string;
}

export const CourseCheckout = ({ courseId, courseTitle, coursePrice, customerId }: CourseCheckoutProps) => {
  const [licenses, setLicenses] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = coursePrice * licenses;

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sie müssen angemeldet sein");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-course-checkout', {
        body: {
          courseId,
          customerId,
          licenses
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Fehler beim Erstellen der Checkout-Session");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Kurs kaufen
        </CardTitle>
        <CardDescription>
          Schließen Sie Ihren Kauf ab und erhalten Sie sofortigen Zugang
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold">{courseTitle}</h3>
          <p className="text-2xl font-bold">CHF {coursePrice.toFixed(2)}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenses" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Anzahl Lizenzen
          </Label>
          <Input
            id="licenses"
            type="number"
            min={1}
            max={100}
            value={licenses}
            onChange={(e) => setLicenses(Math.max(1, parseInt(e.target.value) || 1))}
          />
          <p className="text-sm text-muted-foreground">
            Kaufen Sie mehrere Lizenzen für Ihr Team
          </p>
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex justify-between">
            <span>Lizenzen:</span>
            <span>{licenses}x</span>
          </div>
          <div className="flex justify-between">
            <span>Preis pro Lizenz:</span>
            <span>CHF {coursePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Gesamt:</span>
            <span>CHF {totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCheckout} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isLoading ? "Wird geladen..." : "Zur Kasse"}
        </Button>
      </CardFooter>
    </Card>
  );
};
