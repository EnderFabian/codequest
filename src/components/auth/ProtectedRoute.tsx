import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_HOME, type UserRole } from '../../types/auth'

type Props = {
  children: React.ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: Props) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />
  }

  if (roles && !roles.includes(user.rol)) {
    return <Navigate to={ROLE_HOME[user.rol]} replace />
  }

  return children
}
