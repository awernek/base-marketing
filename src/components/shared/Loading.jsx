export default function Loading({ message = 'Carregando...' }) {
  return (
    <div className="min-h-[12rem] flex items-center justify-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
