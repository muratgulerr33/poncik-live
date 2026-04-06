type LivePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function LivePage({ params }: LivePageProps) {
  const { username } = await params;

  return <main>{username}</main>;
}
