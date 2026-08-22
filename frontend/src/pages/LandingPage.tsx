import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Plane, User, Sparkles, MapPin, Calendar, Users, ShieldCheck, HeadphonesIcon } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-page-bg relative overflow-hidden font-sans text-brand-dark">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-soft rounded-full mix-blend-multiply filter blur-[150px] opacity-80"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[70%] bg-brand-mint rounded-full mix-blend-multiply filter blur-[150px] opacity-70"></div>
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-brand-fresh/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-50"></div>
      </div>

      {/* Full-width Sticky Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-brand-deep text-white p-2 rounded-xl shadow-md group-hover:bg-brand-fresh transition-colors duration-500">
              <Plane size={22} className="transform -rotate-45 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-brand-dark">GlobeTrotter</span>
          </div>

          <div className="hidden md:flex space-x-10">
            <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')} className="font-semibold text-brand-dark hover:text-brand-fresh transition-colors tracking-wide">My Trips</button>
            <a href="#" className="font-semibold text-brand-gray hover:text-brand-fresh transition-colors tracking-wide">Destinations</a>
            <a href="#" className="font-semibold text-brand-gray hover:text-brand-fresh transition-colors tracking-wide">Community</a>
            <a href="#" className="font-semibold text-brand-gray hover:text-brand-fresh transition-colors tracking-wide">About</a>
          </div>

          <button 
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            className="flex items-center space-x-2 bg-brand-dark px-5 py-2.5 rounded-full shadow-md text-white hover:bg-brand-deep hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <User size={18} />
            <span className="font-bold text-sm tracking-wide">{isAuthenticated ? 'Dashboard' : 'Sign In'}</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Typography & CTA */}
          <div className="space-y-8 relative">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-fresh/20 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md text-brand-deep px-4 py-2 rounded-full border border-brand-soft shadow-sm hover:bg-white hover:shadow-md transition-all cursor-default">
              <Sparkles size={16} className="text-brand-fresh" />
              <span className="text-sm font-bold uppercase tracking-wider">AI-powered travel planning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.05] text-brand-dark drop-shadow-sm">
              Design your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-deep via-brand-fresh to-[#81C784]">
                perfect journey.
              </span>
            </h1>
            
            <p className="text-xl text-brand-gray max-w-lg leading-relaxed font-medium">
              Experience the world with beautifully curated, AI-generated itineraries tailored exclusively to your tastes.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5 pt-6">
              <button className="bg-brand-deep text-white font-bold text-lg px-8 py-4 rounded-full shadow-glass hover:bg-brand-fresh hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex items-center justify-center space-x-2 relative overflow-hidden group">
                <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
                <Sparkles size={22} className="relative z-10" />
                <span className="relative z-10">Start Planning</span>
              </button>
              <button className="bg-white/80 backdrop-blur text-brand-dark font-bold text-lg px-8 py-4 rounded-full border border-gray-200 shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-500 flex items-center justify-center space-x-2">
                <MapPin size={22} className="text-brand-fresh" />
                <span>Explore Cities</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-4 pt-10">
              <div className="flex -space-x-3">
                <img className="w-12 h-12 rounded-full border-[3px] border-page-bg object-cover shadow-sm hover:-translate-y-1 transition-transform" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100" alt="User 1" />
                <img className="w-12 h-12 rounded-full border-[3px] border-page-bg object-cover shadow-sm hover:-translate-y-1 transition-transform" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100" alt="User 2" />
                <img className="w-12 h-12 rounded-full border-[3px] border-page-bg object-cover shadow-sm hover:-translate-y-1 transition-transform" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" alt="User 3" />
                <img className="w-12 h-12 rounded-full border-[3px] border-page-bg object-cover shadow-sm hover:-translate-y-1 transition-transform" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100" alt="User 4" />
              </div>
              <div className="text-sm">
                <div className="flex items-center space-x-1 text-brand-deep mb-0.5">
                   {[1,2,3,4,5].map(i => <Sparkles key={i} size={14} className="fill-current" />)}
                </div>
                <p className="font-bold text-brand-dark">Join 10,000+ travelers</p>
              </div>
            </div>
          </div>

          {/* Right: 3D Illustration */}
          <div className="relative h-[550px] w-full lg:h-[700px] flex items-center justify-center animate-[float_6s_ease-in-out_infinite]">
             <div className="absolute inset-0 bg-gradient-to-tr from-brand-fresh/20 to-transparent rounded-full filter blur-[80px] -z-10 animate-pulse"></div>
             <img src="/hero_img.png" alt="3D Travel Composition" className="max-w-full max-h-full object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700" />
             
             {/* Floating UI Elements */}
             <div className="absolute top-[10%] right-[10%] bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 animate-[float_5s_ease-in-out_infinite_reverse]">
               <div className="flex items-center space-x-3">
                 <div className="bg-brand-mint text-brand-deep p-2 rounded-lg"><Plane size={20} /></div>
                 <div>
                   <p className="text-xs text-brand-gray font-bold">Flight to Paris</p>
                   <p className="text-sm font-black text-brand-dark">Confirmed</p>
                 </div>
               </div>
             </div>

             <div className="absolute bottom-[20%] left-[5%] bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/50 animate-[float_7s_ease-in-out_infinite]">
               <div className="flex items-center space-x-3">
                 <div className="bg-brand-soft text-brand-deep p-2 rounded-lg"><Calendar size={20} /></div>
                 <div>
                   <p className="text-xs text-brand-gray font-bold">7 Days in Tokyo</p>
                   <p className="text-sm font-black text-brand-dark">Generated by AI</p>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* AI Trip Planner Card */}
        <div className="mt-10 mx-auto max-w-5xl bg-white/60 backdrop-blur-3xl border border-white/80 shadow-[0_30px_100px_rgba(47,125,74,0.15)] rounded-[2.5rem] p-8 lg:p-10 relative z-20 overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-fresh/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div className="flex space-x-8 border-b border-gray-200/50 pb-5 mb-8 relative z-10">
            <button className="flex items-center space-x-2 text-brand-deep font-bold border-b-2 border-brand-fresh pb-5 -mb-[21px] text-lg tracking-wide">
              <Sparkles size={20} />
              <span>AI Trip Planner</span>
            </button>
            <button className="flex items-center space-x-2 text-brand-muted font-bold hover:text-brand-gray pb-5 -mb-[21px] transition-colors text-lg tracking-wide">
              <Calendar size={20} />
              <span>Manual Builder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10">
            <div className="md:col-span-5 relative group/input">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <MapPin size={22} className="text-brand-muted group-focus-within/input:text-brand-fresh transition-colors" />
              </div>
              <input type="text" placeholder="Where do you want to go?" className="w-full bg-white/90 border border-gray-100 rounded-2xl py-5 pl-14 pr-5 text-brand-dark font-medium placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-fresh focus:border-transparent transition-all shadow-sm text-lg hover:shadow-md" />
            </div>
            
            <div className="md:col-span-3 relative group/input">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Calendar size={22} className="text-brand-muted group-focus-within/input:text-brand-fresh transition-colors" />
              </div>
              <input type="text" placeholder="Dates" className="w-full bg-white/90 border border-gray-100 rounded-2xl py-5 pl-14 pr-5 text-brand-dark font-medium placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-fresh focus:border-transparent transition-all shadow-sm text-lg hover:shadow-md" />
            </div>

            <div className="md:col-span-2 relative group/input">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Users size={22} className="text-brand-muted group-hover/input:text-brand-fresh transition-colors" />
              </div>
              <div className="w-full h-full bg-white/90 border border-gray-100 rounded-2xl py-2 pl-14 pr-5 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col justify-center">
                <span className="text-xs text-brand-muted font-bold uppercase tracking-wider">Travelers</span>
                <span className="text-brand-dark font-black text-lg">1</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <button className="w-full h-full bg-brand-dark text-white font-bold rounded-2xl shadow-lg hover:bg-brand-deep hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center space-y-1">
                <Sparkles size={24} />
                <span className="text-sm uppercase tracking-wider">Generate</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Sparkles size={28} />} 
            title="AI-Powered" 
            desc="Smart recommendations instantly tailored to your unique travel style." 
          />
          <FeatureCard 
            icon={<User size={28} />} 
            title="Personalized" 
            desc="Custom itineraries perfectly curated for your personal preferences." 
          />
          <FeatureCard 
            icon={<ShieldCheck size={28} />} 
            title="Trusted & Secure" 
            desc="Your travel plans and personal data stay securely encrypted." 
          />
          <FeatureCard 
            icon={<HeadphonesIcon size={28} />} 
            title="Free of cost" 
            desc="This service is absolutely free to use, with no hidden charges." 
          />
        </div>

      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}} />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-8 shadow-sm hover:-translate-y-3 hover:shadow-glass hover:bg-white/80 transition-all duration-500 cursor-default group relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-brand-soft rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="w-16 h-16 bg-brand-mint text-brand-deep rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-fresh group-hover:text-white transition-all duration-500 shadow-sm relative z-10">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-brand-dark mb-3 relative z-10">{title}</h3>
      <p className="text-brand-gray font-medium leading-relaxed relative z-10 text-lg">{desc}</p>
    </div>
  );
}

export default LandingPage;
