/** Re-mounts on every navigation inside the app, so pages fade in gently. */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
