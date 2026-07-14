import HasilClient from "./HasilClient";

interface HasilPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function HasilPage({ params }: HasilPageProps) {
  const { id } = await params;
  return <HasilClient examId={id} />;
}
