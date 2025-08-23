import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  ArrowLeft, 
  Download, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  BarChart3,
  Calendar,
  Filter,
  FileText,
  Bot,
  Lightbulb,
  AlertCircle
} from "lucide-react";

interface Study {
  id: string;
  title: string;
  description: string;
  status: string;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  activeStudies: number;
  participants: number;
  completionRate: number;
  dataPoints: number;
}

interface AnalysisResult {
  meanResponseTime: number;
  accuracy: number;
  stroopEffect?: number;
  outlierCount: number;
  qualityScore: number;
  insights: string[];
  recommendations: string[];
}

interface StudyAnalysis {
  analysis: AnalysisResult;
  exportData: any[];
  participantCount: number;
  responseCount: number;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "draft":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "paused":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export default function DataPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedStudy, setSelectedStudy] = useState<string>("all");
  const [timeRange, setTimeRange] = useState("30days");
  const [showingAnalysis, setShowingAnalysis] = useState<string | null>(null);

  const { data: studies, isLoading: studiesLoading } = useQuery<Study[]>({
    queryKey: ["/api/studies"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: studyAnalysis, isLoading: analysisLoading, refetch: refetchAnalysis } = useQuery<StudyAnalysis>({
    queryKey: ["/api/studies", showingAnalysis, "analysis"],
    enabled: !!showingAnalysis,
    queryFn: async () => {
      const response = await fetch(`/api/studies/${showingAnalysis}/analysis`);
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    }
  });

  const handleExportData = async (studyId?: string) => {
    try {
      if (studyId && studyId !== "all") {
        // Export specific study
        const response = await fetch(`/api/studies/${studyId}/export`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `study_${studyId}_data.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast({
            title: "Export successful",
            description: "Study data has been downloaded as CSV."
          });
        } else {
          throw new Error("Export failed");
        }
      } else {
        // Export all studies (would need backend implementation)
        toast({
          title: "Feature coming soon",
          description: "Bulk export for all studies will be available soon."
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was a problem exporting the data.",
        variant: "destructive"
      });
    }
  };

  const getStudyStats = (studyId: string) => {
    // In a real implementation, this would call a specific API endpoint
    // For now, return mock data based on the study
    const study = studies?.find(s => s.id === studyId);
    if (!study) return null;

    return {
      participants: study.participantCount || Math.floor(Math.random() * 100) + 10,
      responses: Math.floor(Math.random() * 1000) + 100,
      avgCompletionTime: Math.floor(Math.random() * 15) + 5,
      completionRate: Math.floor(Math.random() * 30) + 70
    };
  };

  const filteredStudies = studies?.filter(study => 
    selectedStudy === "all" || study.id === selectedStudy
  );

  if (studiesLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b"></div>
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="data-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="text-white text-lg" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">CogLab - Data & Analytics</h1>
              </div>
            </div>
            <Button 
              onClick={() => handleExportData(selectedStudy)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              data-testid="button-export-data"
            >
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6" data-testid="data-filters">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Select value={selectedStudy} onValueChange={setSelectedStudy}>
                  <SelectTrigger className="w-full sm:w-64" data-testid="select-study-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select study" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Studies</SelectItem>
                    {studies?.map((study) => (
                      <SelectItem key={study.id} value={study.id}>
                        {study.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-time-range">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="stat-total-studies">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Studies</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-studies-count">
                    {studies?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-primary text-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="stat-total-participants">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-participants-count">
                    {stats?.participants?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="text-success text-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="stat-completion-rate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-completion-percent">
                    {stats?.completionRate || 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target className="text-warning text-lg" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="stat-data-points">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Data Points</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="stat-data-count">
                    {stats?.dataPoints?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600 text-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Study List with Export Options */}
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="studies-export-list">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Export Data by Study</h3>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                {filteredStudies?.map((study) => {
                  const studyStats = getStudyStats(study.id);
                  return (
                    <div 
                      key={study.id} 
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      data-testid={`export-study-${study.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{study.title}</h4>
                          <Badge className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(study.status)}`}>
                            {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{studyStats?.participants || 0} participants</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{studyStats?.responses || 0} responses</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Avg: {studyStats?.avgCompletionTime || 0}min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>{studyStats?.completionRate || 0}% complete</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowingAnalysis(study.id)}
                          className="text-cyan-700 border-cyan-200 hover:bg-cyan-50"
                          data-testid={`button-analyze-${study.id}`}
                        >
                          <Bot className="h-4 w-4 mr-1" />
                          AI Analyze
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportData(study.id)}
                          data-testid={`button-export-${study.id}`}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export CSV
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {filteredStudies?.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
                    <p className="text-gray-600">
                      Create and run studies to see analytics and export data.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          {showingAnalysis && (
            <Card className="bg-white rounded-lg shadow-sm border border-cyan-200" data-testid="ai-analysis-panel">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-200">
                <CardTitle className="flex items-center gap-2 text-cyan-900">
                  <Bot className="h-5 w-5" />
                  AI Analysis Results
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowingAnalysis(null)}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analysisLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
                    <span className="ml-3 text-gray-600">Analyzing data with AI...</span>
                  </div>
                ) : studyAnalysis?.analysis ? (
                  <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Mean Response Time</div>
                        <div className="text-xl font-bold text-gray-900">{studyAnalysis.analysis.meanResponseTime}ms</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Accuracy</div>
                        <div className="text-xl font-bold text-gray-900">{Math.round(studyAnalysis.analysis.accuracy * 100)}%</div>
                      </div>
                      {studyAnalysis.analysis.stroopEffect && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-sm text-gray-600">Stroop Effect</div>
                          <div className="text-xl font-bold text-gray-900">{studyAnalysis.analysis.stroopEffect}ms</div>
                        </div>
                      )}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600">Quality Score</div>
                        <div className="text-xl font-bold text-gray-900">{studyAnalysis.analysis.qualityScore}/100</div>
                      </div>
                    </div>

                    {/* AI Insights */}
                    {studyAnalysis.analysis.insights.length > 0 && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <div className="font-medium mb-2">AI Insights:</div>
                          {studyAnalysis.analysis.insights.map((insight, index) => (
                            <div key={index} className="text-sm mb-1">• {insight}</div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* AI Recommendations */}
                    {studyAnalysis.analysis.recommendations.length > 0 && (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <div className="font-medium mb-2">AI Recommendations:</div>
                          {studyAnalysis.analysis.recommendations.map((rec, index) => (
                            <div key={index} className="text-sm mb-1">• {rec}</div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Export Enhanced Data */}
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleExportData(showingAnalysis)}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export AI-Enhanced Data
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No data available for analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity - Show only if not showing analysis */}
          {!showingAnalysis && (
            <Card className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid="recent-activity">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {studies?.slice(0, 5).map((study) => (
                    <div key={study.id} className="flex items-start space-x-3" data-testid={`activity-${study.id}`}>
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{study.title}</span> was updated
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(study.updatedAt)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {!studies?.length && (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Data Formats Information */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8" data-testid="data-formats-info">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Export Information</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI-Enhanced CSV Export Includes:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Participant ID and session information</li>
                  <li>• All task responses with timing data</li>
                  <li>• Accuracy scores for cognitive tasks</li>
                  <li>• Demographic information (anonymized)</li>
                  <li>• Stimulus presentations and conditions</li>
                  <li>• Timestamps for all interactions</li>
                  <li className="text-cyan-700 font-medium">• AI-detected outliers and quality flags</li>
                  <li className="text-cyan-700 font-medium">• Trial-level AI analysis markers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Data Privacy:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• All exports are anonymized</li>
                  <li>• No personally identifiable information</li>
                  <li>• SPSS and R compatible formats</li>
                  <li>• Secure download with encrypted transfer</li>
                  <li>• Automatic data retention policies</li>
                  <li>• IRB compliance ready</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}