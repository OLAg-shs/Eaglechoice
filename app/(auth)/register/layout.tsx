// Override the (auth) card layout for the register page — it manages its own full-screen layout
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
