import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { CheckCircle2, ListTodo, RefreshCw, Bell } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Left Marketing Side */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-white">
        <div className="max-w-md mx-auto md:mx-0">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 text-white rounded-2xl p-3 shadow-lg shadow-blue-200">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">Task-Flow-Sync</h1>
              <p className="text-lg md:text-xl text-slate-500 mt-1">Plan. Flow. Sync. Get things done.</p>
            </div>
          </div>

          <div className="space-y-8 mt-12">
            <Feature 
              icon={ListTodo} 
              iconColor="text-blue-500" 
              bgColor="bg-blue-50"
              title="Organize Tasks" 
              description="Create and organize your tasks with ease." 
            />
            <Feature 
              icon={RefreshCw} 
              iconColor="text-emerald-500" 
              bgColor="bg-emerald-50"
              title="Sync Everywhere" 
              description="Access and sync your tasks across all your devices." 
            />
            <Feature 
              icon={Bell} 
              iconColor="text-purple-500" 
              bgColor="bg-purple-50"
              title="Stay Focused" 
              description="Get reminders and keep track of what matters." 
            />
          </div>

          <div className="mt-16 flex items-center gap-4 text-slate-400 font-medium text-sm">
            <span className="text-black font-bold text-xl">PWA</span>
            <span>Fast • Reliable • Installable • Offline</span>
          </div>
        </div>
      </div>

      {/* Right Auth Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
      
    </div>
  );
};

interface FeatureProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
}

function Feature({ icon: Icon, iconColor, bgColor, title, description }: FeatureProps) {
  return (
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-full ${bgColor}`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );
}
