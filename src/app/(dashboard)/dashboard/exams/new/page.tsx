import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function NewExamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (userData?.role === 'student') {
    redirect("/dashboard/exams"); // Students cannot create
  }

  const handleCreate = async (formData: FormData) => {
    "use server";
    const supabaseServer = await createClient();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const duration_minutes = parseInt(formData.get("duration") as string);
    const status = formData.get("status") as string;

    const { data, error } = await supabaseServer
      .from('exams')
      .insert({ title, description, duration_minutes, status })
      .select()
      .single();

    if (!error && data) {
      // Revalidate and redirect to edit page
      revalidatePath("/dashboard/exams");
      redirect(`/dashboard/exams/${data.id}/edit`);
    } else {
      console.error(error);
      redirect("/dashboard/exams");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/exams">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buat Ujian Baru</h1>
          <p className="text-muted-foreground">Isi detail dasar modul ujian baru.</p>
        </div>
      </div>

      <Card>
        <form action={handleCreate}>
          <CardHeader>
            <CardTitle>Detail Ujian</CardTitle>
            <CardDescription>Ujian yang baru dibuat tidak akan memiliki soal. Anda dapat menambahkannya nanti.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Ujian</Label>
              <Input id="title" name="title" placeholder="Contoh: Ujian Tengah Semester Sejarah" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" placeholder="Instruksi singkat tentang ujian ini" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (Menit)</Label>
                <Input id="duration" name="duration" type="number" defaultValue={60} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status Awal</Label>
                <select 
                  id="status" 
                  name="status" 
                  defaultValue="draft"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="draft">Draft (Disembunyikan)</option>
                  <option value="published">Published (Tersedia)</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Link href="/dashboard/exams">
              <Button variant="outline" type="button">Batal</Button>
            </Link>
            <Button type="submit"><Save className="w-4 h-4 mr-2" /> Buat Ujian</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
