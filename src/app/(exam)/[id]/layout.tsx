import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { NetworkStatus } from '@/components/NetworkStatus';
import { SecurityEnforcer } from '@/components/exam/SecurityEnforcer';
import { FullscreenGate } from '@/components/exam/FullscreenGate';
import { use } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Ujian Berlangsung - Aruthala Edu',
  description: 'Sistem ujian Aruthala Edu yang aman dan tahan offline.',
};

export default function ExamLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);

  return (
    <div className={`min-h-screen bg-background text-foreground ${inter.className}`}>
      <NetworkStatus />
      <SecurityEnforcer examId={unwrappedParams.id} />
      
      <FullscreenGate examId={unwrappedParams.id}>
        {/* 
          This layout intentionally omits standard navigation bars and footers 
          to provide a distraction-free examination environment. 
        */}
        <main className="w-full h-full min-h-screen flex flex-col">
          {children}
        </main>
      </FullscreenGate>
    </div>
  );
}
