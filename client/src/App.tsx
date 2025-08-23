import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import StudyBuilder from "@/pages/study-builder";
import ParticipantView from "@/pages/participant";
import StudiesPage from "@/pages/studies";
import DataPage from "@/pages/data";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/studies" component={StudiesPage} />
      <Route path="/data" component={DataPage} />
      <Route path="/builder/:id?" component={StudyBuilder} />
      <Route path="/participate/:studyId" component={ParticipantView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
