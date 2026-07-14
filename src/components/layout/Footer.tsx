import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Aruthala Edu</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Membangun ekosistem digital tepercaya untuk sektor pendidikan dengan keamanan data dan integritas sebagai fondasi utama.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">Exam Engine</Link></li>
              <li><Link href="#" className="hover:text-primary">Anti-Cheat</Link></li>
              <li><Link href="#" className="hover:text-primary">Offline Sync</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Aruthala Bangsa Indonesia. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
