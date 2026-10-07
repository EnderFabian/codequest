import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { ChallengePage } from './components/game/ChallengePage'
import { Header } from './components/layout/Header'
import { RouteSky } from './components/three/RouteSky'
import { AuthProvider } from './context/AuthContext'
import { CalmModeProvider } from './context/CalmModeContext'
import { EstudianteHomePage } from './pages/EstudianteHomePage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { PadreHomePage } from './pages/PadreHomePage'
import { ProfesionalHomePage } from './pages/ProfesionalHomePage'

// La vista previa publicada como página estática usa rutas con # (VITE_HASH_ROUTER=1).
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

export default function App() {
  return (
    <CalmModeProvider>
      <AuthProvider>
        <Router>
          <RouteSky />
          <div className="relative z-10 flex min-h-svh flex-col">
            <Header />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/entrar" element={<LoginPage />} />
              <Route
                path="/estudiante"
                element={
                  <ProtectedRoute roles={['estudiante']}>
                    <EstudianteHomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/estudiante/reto/:levelId/:retoId"
                element={
                  <ProtectedRoute roles={['estudiante']}>
                    <ChallengePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/padre"
                element={
                  <ProtectedRoute roles={['padre']}>
                    <PadreHomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profesional"
                element={
                  <ProtectedRoute roles={['profesional']}>
                    <ProfesionalHomePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </CalmModeProvider>
  )
}
