import { BertWorkspace } from "@/components/BertWorkspace";

export default async function JobResumeUploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BertWorkspace initialTab="upload" initialJobId={id} />;
}

