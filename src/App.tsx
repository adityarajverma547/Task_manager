import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthForm } from './components/AuthForm';
import { TaskManager } from './pages/TaskManager';
import { supabase } from './lib/supabase';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Routes>
          <Route
            path="/"
            element={user ? <TaskManager user={user} /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={user ? <Navigate to="/" /> : <AuthForm />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;