import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RotaProtegida } from "./routes/RotaProtegida";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Produtos } from "./pages/Produtos";
import { Movimentacoes } from "./pages/Movimentacoes";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RotaProtegida />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/movimentacoes" element={<Movimentacoes />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
