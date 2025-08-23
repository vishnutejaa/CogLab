import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Play, 
  Pause, 
  Users, 
  Calendar,
  ArrowLeft,
  Download,
  Eye
} from "lucide-react";

interface Study {
  id: string;
  title: string;
  description: string;
  status: string;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
  experimentBlocks: any[];
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function StudiesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");

  const { data: studies, isLoading } = useQuery<Study[]>({
    queryKey: ["/api/studies"],
  });

  const deleteStudyMutation = useMutation({
    mutationFn: (studyId: string) => apiRequest("DELETE", `/api/studies/${studyId}`, {}),
    onSuccess: () => {
      toast({
        title: "Study deleted",
        description: "The study has been permanently deleted."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/studies"] });
    },
    onError: () => {
      toast({
        title: "Error deleting study",
        description: "There was a problem deleting the study.",
        variant: "destructive"
      });
    }
  });

  const updateStudyStatusMutation = useMutation({
    mutationFn: ({ studyId, status }: { studyId: string; status: string }) => 
      apiRequest("PUT", `/api/studies/${studyId}`, { status }),
    onSuccess: () => {
      toast({
        title: "Study status updated",
        description: "The study status has been changed."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/studies"] });
    },
    onError: () => {
      toast({
        title: "Error updating study",
        description: "There was a problem updating the study status.",
        variant: "destructive"
      });
    }
  });

  const duplicateStudyMutation = useMutation({
    mutationFn: (originalStudy: Study) => {
      const duplicatedStudy = {
        title: `${originalStudy.title} (Copy)`,
        description: originalStudy.description,
        experimentBlocks: originalStudy.experimentBlocks,
        status: "draft"
      };
      return apiRequest("POST", "/api/studies", duplicatedStudy);
    },
    onSuccess: () => {
      toast({
        title: "Study duplicated",
        description: "A copy of the study has been created."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/studies"] });
    },
    onError: () => {
      toast({
        title: "Error duplicating study",
        description: "There was a problem creating a copy of the study.",
        variant: "destructive"
      });
    }
  });

  const filteredAndSortedStudies = studies?.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || study.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "status":
        return a.status.localeCompare(b.status);
      case "participants":
        return b.participantCount - a.participantCount;
      case "created":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "updated":
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const handleDeleteStudy = (studyId: string) => {
    if (window.confirm("Are you sure you want to delete this study? This action cannot be undone.")) {
      deleteStudyMutation.mutate(studyId);
    }
  };

  const handleStatusChange = (studyId: string, newStatus: string) => {
    updateStudyStatusMutation.mutate({ studyId, status: newStatus });
  };

  const handleDuplicateStudy = (study: Study) => {
    duplicateStudyMutation.mutate(study);
  };

  const getParticipationLink = (studyId: string) => {
    return `${window.location.origin}/participate/${studyId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b"></div>
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="studies-page">
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
                <h1 className="text-xl font-bold text-gray-900">CogLab - Studies</h1>
              </div>
            </div>
            <Button 
              onClick={() => setLocation("/builder")}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              data-testid="button-create-study"
            >
              <Plus className="h-5 w-5" />
              <span>Create New Study</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6" data-testid="studies-filters">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search studies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="participants">Participants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Studies List */}
        <div className="space-y-4">
          {filteredAndSortedStudies?.length === 0 ? (
            <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first psychology experiment."
                  }
                </p>
                <Button 
                  onClick={() => setLocation("/builder")}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Study
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedStudies?.map((study) => (
              <Card key={study.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow" data-testid={`study-card-${study.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900" data-testid={`study-title-${study.id}`}>
                          {study.title}
                        </h3>
                        <Badge className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(study.status)}`} data-testid={`study-status-${study.id}`}>
                          {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3" data-testid={`study-description-${study.id}`}>
                        {study.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{study.participantCount || 0} participants</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Updated {formatDate(study.updatedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{study.experimentBlocks?.length || 0} blocks</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {study.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = getParticipationLink(study.id);
                            navigator.clipboard.writeText(link);
                            toast({
                              title: "Link copied",
                              description: "Participation link copied to clipboard."
                            });
                          }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          data-testid={`button-copy-link-${study.id}`}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/builder/${study.id}`)}
                        className="text-gray-600 hover:text-gray-900"
                        data-testid={`button-edit-${study.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>

                      {study.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(study.id, "paused")}
                          className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          data-testid={`button-pause-${study.id}`}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      ) : study.status === "draft" || study.status === "paused" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(study.id, "active")}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          data-testid={`button-activate-${study.id}`}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      ) : null}

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-600"
                          data-testid={`button-menu-${study.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        {/* Dropdown menu would go here in a real implementation */}
                      </div>
                    </div>
                  </div>
                  
                  {study.status === "active" && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-800 font-medium">Participation Link:</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/participate/${study.id}`, '_blank')}
                          className="text-blue-600 hover:bg-blue-100"
                          data-testid={`button-preview-${study.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                      <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded mt-2 block">
                        {getParticipationLink(study.id)}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}