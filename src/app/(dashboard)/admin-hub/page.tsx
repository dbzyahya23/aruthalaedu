import Link from "next/link";
import { Building2, Settings2, ShieldCheck, Users } from "lucide-react";

const MODULES = [
  { title: "School Management", desc: "Konfigurasi sekolah, tenant, dan branding.", icon: Building2 },
  { title: "User Management", desc: "CRUD guru, siswa, admin, dan role akses.", icon: Users },
  { title: "Security & RLS", desc: "Kontrol keamanan, audit log, dan policy.", icon: ShieldCheck },
  { title: "System Config", desc: "Theme, fitur aktif, dan preferensi sistem.", icon: Settings2 },
];

export default function AdminHubPage() {
  return (
    <div className="space-y-6">
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="page-title">Hub Admin</h1>
          <p className="page-subtitle">Manajemen sekolah, user, kelas, dan konfigurasi tenant.</p>
        </div>
        <Link href="/settings" className="btn-primary inline-flex items-center gap-2 self-start lg:self-auto">
          <Settings2 className="h-4 w-4" /> Buka Pengaturan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Sekolah Aktif", value: "3" },
          { label: "Total User", value: "1.248" },
          { label: "Kelas Terdaftar", value: "42" },
          { label: "Tenant Health", value: "Normal" },
        ].map((item) => (
          <div key={item.label} className="card card-padding">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.title} className="card card-padding">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-gray-900">{module.title}</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">{module.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}