import AuthNav from "../components/AuthNav";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold">
          Welcome to AI Interview Mocker 🤖
        </h1>
        <p className="text-xl text-gray-600">
          Practice your interview skills with our AI-powered mock interview
          platform.
        </p>
        <AuthNav />
      </div>
    </main>
  );
}
