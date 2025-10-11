import { DeleteAccount } from "@/components/lms/DeleteAccount";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account löschen</h1>
          <DeleteAccount />
        </div>
      </main>
      <Footer />
    </div>
  );
}