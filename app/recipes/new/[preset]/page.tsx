interface PageProps {
  params: Promise<{ preset: string }>;
}

export default async function Page({ params }: PageProps) {
  const { preset } = await params;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-6 pb-10">
      <p className="text-ink-2 mt-12 text-center">
        טופס מתכון — נכנס ב-T7 ·{" "}
        <span dir="ltr" className="num">
          {preset}
        </span>
      </p>
    </main>
  );
}
