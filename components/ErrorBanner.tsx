export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-900 text-red-300 border border-red-600 rounded p-2 mb-4 font-mono">
      {message}
    </div>
  );
}
