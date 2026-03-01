export default function BoardLayout({
  children,
  detail,
}: {
  children: React.ReactNode;
  detail: React.ReactNode;
}) {
  return (
    <>
      {children}
      {detail}
    </>
  );
}
