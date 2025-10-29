export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <h1 className="text-xl font-semibold">Något gick fel vid inloggningen</h1>
      <a href="/login" className="mt-4 underline">Försök igen</a>
    </div>
  )
}
