import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AbrirChamado from "./pages/AbrirChamado";
import ConsultarProtocolo from "./pages/ConsultarProtocolo";
import ChamadoConfirmado from "./pages/ChamadoConfirmado";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminChamados from "./pages/admin/Chamados";
import AdminChamadoDetalhe from "./pages/admin/ChamadoDetalhe";

function Router() {
  return (
    <Switch>
      {/* Público */}
      <Route path="/" component={Home} />
      <Route path="/abrir-chamado" component={AbrirChamado} />
      <Route path="/chamado-confirmado/:protocolo" component={ChamadoConfirmado} />
      <Route path="/consultar" component={ConsultarProtocolo} />

      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/chamados" component={AdminChamados} />
      <Route path="/admin/chamados/:id" component={AdminChamadoDetalhe} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
