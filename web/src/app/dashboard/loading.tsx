import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left column - URL shortener and stats */}
        <div className="md:w-1/3">
          <Card className="mb-8 hover:shadow-md transition-all duration-300">
            <CardHeader>
              <div className="h-8 w-3/4 bg-neutral-200 animate-pulse rounded-lg"></div>
              <div className="h-4 w-full bg-neutral-200 animate-pulse rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-12 w-full bg-neutral-200 animate-pulse rounded-xl"></div>
                <div className="h-12 w-full bg-neutral-200 animate-pulse rounded-xl"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border-neutral-100">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/50">
              <div className="h-7 w-1/2 bg-neutral-200 animate-pulse rounded-lg"></div>
              <div className="h-4 w-3/4 bg-neutral-200 animate-pulse rounded-lg"></div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-white to-neutral-50 p-6 rounded-xl border border-neutral-100 shadow-sm">
                  <div className="h-4 w-1/3 bg-neutral-200 animate-pulse rounded mb-2"></div>
                  <div className="h-8 w-1/2 bg-neutral-200 animate-pulse rounded"></div>
                </div>
                <div className="bg-gradient-to-br from-white to-neutral-50 p-6 rounded-xl border border-neutral-100 shadow-sm">
                  <div className="h-4 w-1/3 bg-neutral-200 animate-pulse rounded mb-2"></div>
                  <div className="h-8 w-1/2 bg-neutral-200 animate-pulse rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - URL list */}
        <div className="md:w-2/3">
          <Card className="hover:shadow-md transition-all duration-300 border-neutral-100">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/50">
              <div className="h-7 w-1/2 bg-neutral-200 animate-pulse rounded-lg"></div>
              <div className="h-4 w-3/4 bg-neutral-200 animate-pulse rounded-lg"></div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {Array(5).fill(null).map((_, i) => (
                  <div key={i} className="h-12 w-full bg-neutral-200 animate-pulse rounded-xl"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
