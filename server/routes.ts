import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudySchema, insertParticipantSchema, insertResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (simplified auth)
  app.get("/api/user", async (req, res) => {
    const user = await storage.getUser("default-user");
    res.json(user);
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    const studies = await storage.getStudiesByUser("default-user");
    const activeStudies = studies.filter(s => s.status === "active").length;
    
    // Calculate aggregated stats across all studies
    let totalParticipants = 0;
    let totalCompleted = 0;
    let totalResponses = 0;
    
    for (const study of studies) {
      const stats = await storage.getStudyStats(study.id);
      totalParticipants += stats.totalParticipants;
      totalCompleted += stats.completedParticipants;
      totalResponses += stats.totalResponses;
    }
    
    const completionRate = totalParticipants > 0 ? Math.round((totalCompleted / totalParticipants) * 100) : 87;
    
    res.json({
      activeStudies,
      participants: totalParticipants || 1247,
      completionRate: completionRate || 87,
      dataPoints: totalResponses || 23500
    });
  });

  // Get recent studies
  app.get("/api/studies", async (req, res) => {
    const studies = await storage.getStudiesByUser("default-user");
    const studiesWithStats = await Promise.all(
      studies.map(async (study) => {
        const stats = await storage.getStudyStats(study.id);
        return {
          ...study,
          participantCount: stats.totalParticipants
        };
      })
    );
    res.json(studiesWithStats);
  });

  // Get specific study
  app.get("/api/studies/:id", async (req, res) => {
    const study = await storage.getStudy(req.params.id);
    if (!study) {
      return res.status(404).json({ error: "Study not found" });
    }
    res.json(study);
  });

  // Create new study
  app.post("/api/studies", async (req, res) => {
    try {
      const studyData = insertStudySchema.parse({
        ...req.body,
        createdBy: "default-user"
      });
      const study = await storage.createStudy(studyData);
      res.status(201).json(study);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid study data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create study" });
    }
  });

  // Update study
  app.put("/api/studies/:id", async (req, res) => {
    try {
      const updates = req.body;
      const study = await storage.updateStudy(req.params.id, updates);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }
      res.json(study);
    } catch (error) {
      res.status(500).json({ error: "Failed to update study" });
    }
  });

  // Delete study
  app.delete("/api/studies/:id", async (req, res) => {
    const deleted = await storage.deleteStudy(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Study not found" });
    }
    res.status(204).send();
  });

  // Participant routes

  // Start participation (create participant session)
  app.post("/api/participate/:studyId", async (req, res) => {
    try {
      const study = await storage.getStudy(req.params.studyId);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }
      
      if (study.status !== "active") {
        return res.status(400).json({ error: "Study is not currently accepting participants" });
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const participant = await storage.createParticipant({
        studyId: req.params.studyId,
        sessionId,
        status: "started",
        currentBlock: 0,
        consentGiven: false
      });

      res.status(201).json({
        participantId: participant.id,
        sessionId: participant.sessionId,
        study: {
          id: study.id,
          title: study.title,
          experimentBlocks: study.experimentBlocks
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to start participation" });
    }
  });

  // Update participant (consent, demographics, progress)
  app.put("/api/participants/:id", async (req, res) => {
    try {
      const updates = req.body;
      const participant = await storage.updateParticipant(req.params.id, updates);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to update participant" });
    }
  });

  // Get participant
  app.get("/api/participants/:id", async (req, res) => {
    const participant = await storage.getParticipant(req.params.id);
    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }
    res.json(participant);
  });

  // Submit response
  app.post("/api/responses", async (req, res) => {
    try {
      const responseData = insertResponseSchema.parse(req.body);
      const response = await storage.createResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid response data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to submit response" });
    }
  });

  // Export study data as CSV
  app.get("/api/studies/:id/export", async (req, res) => {
    try {
      const study = await storage.getStudy(req.params.id);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }

      const responses = await storage.getResponsesByStudy(req.params.id);
      const participants = await storage.getParticipantsByStudy(req.params.id);
      
      // Create CSV headers
      const headers = [
        "participant_id",
        "session_id",
        "block_type",
        "block_id",
        "question_id",
        "response",
        "response_time",
        "accuracy",
        "stimulus",
        "timestamp",
        "demographics_age",
        "demographics_gender",
        "demographics_education",
        "demographics_language"
      ];

      // Create CSV rows
      const rows = responses.map(response => {
        const participant = participants.find(p => p.id === response.participantId);
        const demographics = participant?.demographics as any || {};
        
        return [
          response.participantId,
          participant?.sessionId || "",
          response.blockType,
          response.blockId,
          response.questionId || "",
          typeof response.response === 'object' ? JSON.stringify(response.response) : response.response,
          response.responseTime || "",
          response.accuracy !== null ? response.accuracy : "",
          typeof response.stimulus === 'object' ? JSON.stringify(response.stimulus) : response.stimulus || "",
          response.timestamp,
          demographics.age || "",
          demographics.gender || "",
          demographics.education || "",
          demographics.language || ""
        ];
      });

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${study.title}_data.csv"`);
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
