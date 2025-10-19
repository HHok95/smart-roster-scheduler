import { Button } from "./ui/button";

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="p-4 bg-red-50 text-red-700">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <Button
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </Button>
    </div>
  );
}
