import { Container } from "@/components/Container";
import { ThreadClient } from "./thread-client";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container>
      <ThreadClient threadId={id} />
    </Container>
  );
}