import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Marketplace = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-lg mx-auto shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <span className="text-4xl">🚧</span>
                <h2 className="text-xl font-semibold mt-4 mb-2">Coming Soon</h2>
                <p className="text-gray-600">The Marketplace feature is under construction and will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Marketplace; 