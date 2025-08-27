import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Education Platform v2
          </CardTitle>
          <CardDescription className="text-gray-600">
            React + Vite + Supabase + Tailwind
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
          <p className="text-sm text-gray-500 text-center">
            Migrated from Next.js education platform
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
