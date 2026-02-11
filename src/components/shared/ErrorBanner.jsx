export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between gap-2">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="text-red-600 hover:text-red-800 font-medium">
          ✕
        </button>
      )}
    </div>
  );
}
