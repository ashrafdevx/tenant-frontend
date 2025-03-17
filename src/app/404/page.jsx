export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="text-gray-500">
        The page you’re looking for doesn’t exist.
      </p>
      <a href="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Go to Home
      </a>
    </div>
  );
}
