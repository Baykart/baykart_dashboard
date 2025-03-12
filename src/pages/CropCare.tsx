import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CropCare = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900">Crop Care</h1>
              <Button>
                <Sprout className="h-4 w-4 mr-1" />
                New Care Plan
              </Button>
            </div>

            <Card className="w-full shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sprout className="h-5 w-5 mr-2 text-primary" />
                  Welcome to Crop Care
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-center py-12">Coming Soon!</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CropCare; 