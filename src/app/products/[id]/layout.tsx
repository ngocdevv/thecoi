// This is a server component that exports generateStaticParams
export function generateStaticParams() {
  try {
    // For static export, we'll pre-render a few sample IDs
    // In a real app, you might fetch these from your database
    return [{ id: "1" }, { id: "2" }, { id: "3" }];
  } catch (error) {
    console.error("Error generating static params for products:", error);
    return [];
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
