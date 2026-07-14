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

export default async function EditExamPage({ params }: { params: Promise<{ exam_id: string }> }) {
  const unwrappedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check role
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (userData?.role === 'student') {
    redirect("/dashboard/exams"); // Students cannot edit
  }

  const { data: exam } = await supabase.from('exams').select('*').eq('id', unwrappedParams.exam_id).single();

  if (!exam) {
    return <div>Ujian tidak ditemukan.</div>;
  }

  const handleSave = async (formData: FormData) => {
    "use server";
    const supabaseServer = await createClient();
    
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const duration_minutes = parseInt(formData.get("duration") as string);
    const status = formData.get("status") as string;

    await supabaseServer
      .from('exams')
      .update({ title, description, duration_minutes, status })
      .eq('id', exam.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/exams");
    redirect("/dashboard/exams");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/exams">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Ujian</h1>
          <p className="text-muted-foreground">Ubah detail dan status publikasi modul ini.</p>
        </div>
      </div>

      <Card>
        <form action={handleSave}>
          <CardHeader>
            <CardTitle>Detail Informasi Ujian</CardTitle>
            <CardDescription>ID: {exam.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Ujian</Label>
              <Input id="title" name="title" defaultValue={exam.title} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" defaultValue={exam.description} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (Menit)</Label>
                <Input id="duration" name="duration" type="number" defaultValue={exam.duration_minutes} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status" 
                  name="status" 
                  defaultValue={exam.status}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="draft">Draft (Disembunyikan)</option>
                  <option value="published">Published (Tersedia)</option>
                  <option value="archived">Archived (Arsip)</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-4 bg-muted/10">
            <div className="flex gap-2">
              <Link href={`/dashboard/exams/${exam.id}/questions`}>
                <Button variant="secondary" type="button" size="sm">Manajemen Soal</Button>
              </Link>
              <Link href={`/dashboard/exams/${exam.id}/results`}>
                <Button variant="secondary" type="button" size="sm">Analisis Hasil</Button>
              </Link>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/exams">
                <Button variant="outline" type="button" size="sm">Batal</Button>
              </Link>
              <Button type="submit" size="sm"><Save className="w-4 h-4 mr-2" /> Simpan</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
