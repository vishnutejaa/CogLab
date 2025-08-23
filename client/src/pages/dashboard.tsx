import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Plus, Users, TrendingUp, Database, Eye, Image, ClipboardList, FlaskConical, MoreHorizontal, Bell } from "lucide-react";

interface DashboardStats {
  activeStudies: number;
  participants: number;
  completionRate: number;
  dataPoints: number;
}

interface Study {
  id: string;
  title: string;
  description: string;
  status: string;
  participantCount: number;
  updatedAt: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return <Eye className="h-4 w-4 text-primary" />;
    case "draft":
      return <Image className="h-4 w-4 text-purple-600" />;
    case "completed":
      return <ClipboardList className="h-4 w-4 text-success" />;
    default:
      return <ClipboardList className="h-4 w-4 text-gray-500" />;
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Updated now";
  if (diffInHours < 24) return `Updated ${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `Updated ${diffInDays}d ago`;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: studies, isLoading: studiesLoading } = useQuery<Study[]>({
    queryKey: ["/api/studies"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleCreateNewStudy = () => {
    setLocation("/builder");
  };

  const handleSelectTemplate = (template: string) => {
    setLocation(`/builder?template=${template}`);
  };

  if (statsLoading || studiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b"></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="space-y-8">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-page">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="text-white text-lg" />
                </div>
                <h1 className="text-xl font-bold text-gray-900" data-testid="app-title">CogLab</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <button className="text-primary font-medium border-b-2 border-primary pb-1" data-testid="nav-dashboard">
                  Dashboard
                </button>
                <button 
                  onClick={() => setLocation("/studies")}
                  className="text-gray-600 hover:text-gray-900 pb-1" 
                  data-testid="nav-studies"
                >
                  Studies
                </button>
                <button className="text-gray-600 hover:text-gray-900 pb-1" data-testid="nav-templates">
                  Templates
                </button>
                <button 
                  onClick={() => setLocation("/data")}
                  className="text-gray-600 hover:text-gray-900 pb-1" 
                  data-testid="nav-data"
                >
                  Data
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900" data-testid="notifications-button">
                <Bell className="h-5 w-5" />
              </button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700" data-testid="user-initials">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900" data-testid="welcome-title">
                Welcome back, {user?.firstName || "Dr. Smith"}
              </h2>
              <p className="text-gray-600 mt-1" data-testid="welcome-subtitle">
                Manage your psychology experiments and collect insights
              </p>
            </div>
            <Button 
              onClick={handleCreateNewStudy}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              data-testid="button-create-study"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Study</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white rounded-lg p-6 shadow-sm border border-gray-200" data-testid="card-active-studies">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Studies</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="stat-active-studies">
                      {stats?.activeStudies || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FlaskConical className="text-primary text-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg p-6 shadow-sm border border-gray-200" data-testid="card-total-participants">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Participants</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="stat-participants">
                      {stats?.participants?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="text-success text-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg p-6 shadow-sm border border-gray-200" data-testid="card-completion-rate">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="stat-completion-rate">
                      {stats?.completionRate || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-warning text-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg p-6 shadow-sm border border-gray-200" data-testid="card-data-points">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data Points</p>
                    <p className="text-2xl font-bold text-gray-900" data-testid="stat-data-points">
                      {stats?.dataPoints?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Database className="text-purple-600 text-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Studies Section */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8" data-testid="card-recent-studies">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Studies</h3>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              {studies?.slice(0, 3).map((study) => (
                <div 
                  key={study.id} 
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
                  data-testid={`study-item-${study.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getStatusIcon(study.status)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900" data-testid={`study-title-${study.id}`}>
                        {study.title}
                      </h4>
                      <p className="text-sm text-gray-600" data-testid={`study-description-${study.id}`}>
                        {study.description} • {study.participantCount || 0} participants
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`} data-testid={`study-status-${study.id}`}>
                      {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-600" data-testid={`study-updated-${study.id}`}>
                      {formatTimeAgo(study.updatedAt)}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600" data-testid={`study-menu-${study.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Templates Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="card-templates">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Popular Templates</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectTemplate("stroop")}
                  data-testid="template-stroop"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="text-primary text-sm" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Stroop Task</h4>
                    <p className="text-sm text-gray-600">Classic color-word interference test</p>
                  </div>
                </div>
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectTemplate("memory")}
                  data-testid="template-memory"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="text-purple-600 text-sm" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Image Recall</h4>
                    <p className="text-sm text-gray-600">Visual memory assessment task</p>
                  </div>
                </div>
                <div 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectTemplate("survey")}
                  data-testid="template-survey"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="text-success text-sm" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Survey Template</h4>
                    <p className="text-sm text-gray-600">Customizable questionnaire builder</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="card-getting-started">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Upload IRB Documentation</h4>
                    <p className="text-sm text-gray-600">Ensure compliance with ethics requirements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Design Your Experiment</h4>
                    <p className="text-sm text-gray-600">Use our drag-and-drop builder</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Share & Collect Data</h4>
                    <p className="text-sm text-gray-600">Generate participant links and monitor progress</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
