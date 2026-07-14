import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { User, Shield, Mail, Zap } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Akun</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan preferensi keamanan Anda.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-4 text-3xl font-bold uppercase">
                {userData?.name?.charAt(0) || user.email?.charAt(0)}
              </div>
              <h3 className="font-semibold text-lg">{userData?.name}</h3>
              <p className="text-sm text-muted-foreground">{userData?.role === 'admin' ? 'Administrator' : userData?.role === 'teacher' ? 'Guru' : 'Siswa'}</p>
              
              {userData?.role === 'admin' && (
                <form action="/api/seed" method="POST" className="mt-6">
                  <Button variant="destructive" className="w-full shadow-lg hover:shadow-red-500/20" size="sm">
                    <Zap className="w-4 h-4 mr-2" />
                    Auto Generate Demo Data
                  </Button>
                  <p className="text-[10px] text-muted-foreground mt-2">Mode Developer: Hasilkan soal dummy.</p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Informasi Profil</CardTitle>
              <CardDescription>Data diri Anda yang terdaftar dalam sistem Aruthala Edu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input value={userData?.name || ''} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label>Email <Mail className="inline w-3 h-3 ml-1" /></Label>
                <Input value={user.email || ''} readOnly className="bg-muted/50 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <Label>ID Unik Pengguna</Label>
                <Input value={user.id} readOnly className="bg-muted/50 cursor-not-allowed font-mono text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Keamanan & Peran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                <div>
                  <p className="font-medium">Tingkat Akses (Role)</p>
                  <p className="text-sm text-muted-foreground">Hak akses yang diberikan pada akun ini.</p>
                </div>
                <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                  {userData?.role}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                *Hubungi administrator sekolah Anda jika terdapat kesalahan pada data profil.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
