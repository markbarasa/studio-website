// app/admin-test/page.tsx
export default function AdminTest() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page Works!</h1>
        <p className="text-zinc-400">If you see this, React is rendering correctly.</p>
        <a href="/admin" className="text-blue-400 mt-4 inline-block">Go to Admin →</a>
      </div>
    </div>
  );
}