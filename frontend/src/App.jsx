import { Navigate, Route, Routes } from 'react-router-dom';
import ChatbotWidget from './components/ChatbotWidget';
import Footer from './components/Footer';
import GlobalAnimatedBackground from './components/GlobalAnimatedBackground';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import BriefCreatePage from './pages/BriefCreatePage';
import BriefMatchesPage from './pages/BriefMatchesPage';
import BriefsPage from './pages/BriefsPage';
import CreatorsPage from './pages/CreatorsPage';
import CreatorProfilePage from './pages/CreatorProfilePage';
import DashboardPage from './pages/DashboardPage';
import EngagementsPage from './pages/EngagementsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PortfolioPage from './pages/PortfolioPage';
import ProfilePage from './pages/ProfilePage';
import AIAgentPage from './pages/AIAgentPage';
import RegisterPage from './pages/RegisterPage';
import VerificationReviewPage from './pages/VerificationReviewPage';

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell bg-[var(--ct-bg)] text-[var(--ct-ink)]">
        <GlobalAnimatedBackground />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/creators" element={<ProtectedRoute><CreatorsPage /></ProtectedRoute>} />
            <Route path="/creators/:id" element={<ProtectedRoute><CreatorProfilePage /></ProtectedRoute>} />

            <Route path="/agent" element={<ProtectedRoute><AIAgentPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute requiredRole="creator"><PortfolioPage /></ProtectedRoute>} />
            <Route path="/briefs" element={<ProtectedRoute><BriefsPage /></ProtectedRoute>} />
            <Route path="/briefs/create" element={<ProtectedRoute requiredRole="brand"><BriefCreatePage /></ProtectedRoute>} />
            <Route path="/briefs/:id/matches" element={<ProtectedRoute requiredRole="brand"><BriefMatchesPage /></ProtectedRoute>} />
            <Route path="/engagements" element={<ProtectedRoute><EngagementsPage /></ProtectedRoute>} />
            <Route path="/verification/review" element={<ProtectedRoute requiredRole="reviewer"><VerificationReviewPage /></ProtectedRoute>} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
        <Footer />
        <ChatbotWidget />
      </div>
    </AuthProvider>
  );
}
