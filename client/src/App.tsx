import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { CallbackPage } from './pages/CallbackPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
            <Header />
            <main className="flex flex-col flex-1 min-h-0">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/auth/callback" element={<CallbackPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App
