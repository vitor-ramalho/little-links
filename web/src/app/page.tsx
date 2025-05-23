import Image from "next/image";
import { ShortenUrlForm } from "@/components/features/ShortenUrlForm";

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero + Form Section combined for immediate visibility */}
      <section className="min-h-[90vh] flex flex-col md:flex-row items-center justify-between py-6 md:py-0">
        <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Simplify your links,
            </span> 
            <span className="block mt-2">amplify your reach</span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-neutral-500 max-w-xl">
            Create short, memorable links that redirect anywhere on the web, with 
            built-in analytics to track performance.
          </p>
          
          <div className="flex flex-wrap md:justify-start justify-center gap-3 mt-8">
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 rounded-xl flex items-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Image 
                  src="/globe.svg" 
                  alt="Globe icon" 
                  width={20} 
                  height={20}
                />
              </div>
              <span className="font-medium text-sm">Universal shortening</span>
            </div>
            
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 rounded-xl flex items-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Image 
                  src="/window.svg" 
                  alt="Analytics icon" 
                  width={20} 
                  height={20}
                />
              </div>
              <span className="font-medium text-sm">Click analytics</span>
            </div>
            
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 rounded-xl flex items-center shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
              <div className="bg-primary/10 p-2 rounded-lg mr-3">
                <Image 
                  src="/link.svg" 
                  alt="Link icon" 
                  width={20} 
                  height={20}
                />
              </div>
              <span className="font-medium text-sm">Custom links</span>
            </div>
          </div>
        </div>
        
        {/* URL Shortener Form - Now displayed alongside the hero section for immediate visibility */}
        <div className="md:w-5/12 w-full">
          <ShortenUrlForm isAuthenticated={false} />
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24">
        <h2 className="text-3xl font-bold text-center mb-6">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Why choose LittleLink?
          </span>
        </h2>
        
        <p className="text-neutral-500 text-center mb-16 max-w-xl mx-auto">
          A powerful URL shortening platform with all the features you need in a clean, simple interface.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] group">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Simple & Fast</h3>
            <p className="text-neutral-600">
              No complicated setup. Create short links instantly and share them anywhere with just a few clicks.
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] group">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Detailed Analytics</h3>
            <p className="text-neutral-600">
              Track clicks, geographic data, and referrers to optimize your links and understand your audience.
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] group">
            <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M16 8V5L19 2L22 5L19 8H16ZM16 8L12 11.9999M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-3">Custom Branding</h3>
            <p className="text-neutral-600">
              Create memorable links with custom slugs that reflect your brand and increase recognition.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
