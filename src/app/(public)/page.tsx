import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, WifiOff, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Ekosistem Pendidikan Digital <br className="hidden md:block" />
            <span className="text-primary">Tangguh & Tepercaya</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Aruthala Edu (ARUS) menghadirkan Learning Management System dengan ujian offline-ready dan perlindungan anti-kecurangan level browser.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">Buka Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">Masuk / Login</Button>
              </Link>
            )}
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">Pelajari Fitur</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Fitur Utama ARUS</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Sistem yang dirancang khusus untuk menjawab tantangan infrastruktur dan integritas di sekolah Indonesia.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background/50 border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-xl mb-4">
                  <WifiOff className="text-primary w-6 h-6" />
                </div>
                <CardTitle>Offline-Ready Engine</CardTitle>
                <CardDescription>Ujian tetap berjalan lancar meski koneksi internet putus. Data tersimpan lokal dan sinkronisasi otomatis.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-background/50 border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-xl mb-4">
                  <ShieldCheck className="text-primary w-6 h-6" />
                </div>
                <CardTitle>Anti-Cheat Security</CardTitle>
                <CardDescription>Proteksi pindah tab, mode layar penuh wajib, dan pemblokiran pintasan keyboard (copy-paste, F12).</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-background/50 border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-xl mb-4">
                  <LayoutDashboard className="text-primary w-6 h-6" />
                </div>
                <CardTitle>Realtime Dashboard</CardTitle>
                <CardDescription>Guru dapat memantau aktivitas ujian dan anomali/kecurangan siswa secara real-time dari satu tempat.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
