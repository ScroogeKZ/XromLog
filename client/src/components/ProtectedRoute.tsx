import { ReactElement } from "react";
import { Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles = ["employee", "manager"] }: ProtectedRouteProps) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      return await auth.getCurrentUser();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Доступ запрещен</h1>
          <p className="text-gray-600 mb-4">
            У вас нет прав доступа к этой странице. Требуемые роли: {allowedRoles.join(", ")}.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Ваша текущая роль: <span className="font-medium">{user.role}</span>
          </p>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return children;
}