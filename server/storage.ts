import { type User, type InsertUser, type Study, type InsertStudy, type Participant, type InsertParticipant, type Response, type InsertResponse } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Studies
  getStudy(id: string): Promise<Study | undefined>;
  getStudiesByUser(userId: string): Promise<Study[]>;
  createStudy(study: InsertStudy): Promise<Study>;
  updateStudy(id: string, updates: Partial<Study>): Promise<Study | undefined>;
  deleteStudy(id: string): Promise<boolean>;
  
  // Participants
  getParticipant(id: string): Promise<Participant | undefined>;
  getParticipantsByStudy(studyId: string): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant | undefined>;
  
  // Responses
  getResponsesByParticipant(participantId: string): Promise<Response[]>;
  getResponsesByStudy(studyId: string): Promise<Response[]>;
  createResponse(response: InsertResponse): Promise<Response>;
  
  // Analytics
  getStudyStats(studyId: string): Promise<{
    totalParticipants: number;
    completedParticipants: number;
    completionRate: number;
    totalResponses: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private studies: Map<string, Study>;
  private participants: Map<string, Participant>;
  private responses: Map<string, Response>;

  constructor() {
    this.users = new Map();
    this.studies = new Map();
    this.participants = new Map();
    this.responses = new Map();
    
    // Create a default user for demo purposes
    const defaultUser: User = {
      id: "default-user",
      username: "researcher",
      password: "password",
      firstName: "Dr.",
      lastName: "Smith"
    };
    this.users.set(defaultUser.id, defaultUser);
    
    // Create some sample studies for the dashboard
    const sampleStudies: Study[] = [
      {
        id: "study-1",
        title: "Stroop Color-Word Task",
        description: "Visual attention experiment",
        createdBy: "default-user",
        status: "active",
        consentForm: "Sample consent form content",
        debriefMessage: "Thank you for participating",
        experimentBlocks: [
          { id: "consent", type: "consent", title: "Consent Form" },
          { id: "demographics", type: "demographics", title: "Demographics" },
          { id: "stroop", type: "stroop", title: "Stroop Task", trials: 60, duration: 5000 },
          { id: "survey", type: "survey", title: "Post-Task Survey" },
          { id: "debrief", type: "debrief", title: "Debrief" }
        ],
        conditions: ["control", "experimental"],
        randomizeConditions: true,
        createdAt: new Date("2024-08-20T10:00:00Z"),
        updatedAt: new Date("2024-08-22T14:30:00Z")
      },
      {
        id: "study-2",
        title: "Image Recall Memory Task",
        description: "Memory assessment",
        createdBy: "default-user",
        status: "draft",
        consentForm: "Sample consent form content",
        debriefMessage: "Thank you for participating",
        experimentBlocks: [
          { id: "consent", type: "consent", title: "Consent Form" },
          { id: "demographics", type: "demographics", title: "Demographics" },
          { id: "memory", type: "image_recall", title: "Image Recall Task", images: 20, studyTime: 3000, recallTime: 10000 },
          { id: "debrief", type: "debrief", title: "Debrief" }
        ],
        conditions: ["control"],
        randomizeConditions: false,
        createdAt: new Date("2024-08-21T15:00:00Z"),
        updatedAt: new Date("2024-08-21T15:00:00Z")
      },
      {
        id: "study-3",
        title: "Social Cognition Survey",
        description: "Behavioral assessment",
        createdBy: "default-user",
        status: "completed",
        consentForm: "Sample consent form content",
        debriefMessage: "Thank you for participating",
        experimentBlocks: [
          { id: "consent", type: "consent", title: "Consent Form" },
          { id: "demographics", type: "demographics", title: "Demographics" },
          { id: "survey", type: "survey", title: "Social Cognition Survey" },
          { id: "debrief", type: "debrief", title: "Debrief" }
        ],
        conditions: ["control"],
        randomizeConditions: false,
        createdAt: new Date("2024-08-18T09:00:00Z"),
        updatedAt: new Date("2024-08-19T16:00:00Z")
      }
    ];
    
    sampleStudies.forEach(study => this.studies.set(study.id, study));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStudy(id: string): Promise<Study | undefined> {
    return this.studies.get(id);
  }

  async getStudiesByUser(userId: string): Promise<Study[]> {
    return Array.from(this.studies.values())
      .filter(study => study.createdBy === userId)
      .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
  }

  async createStudy(insertStudy: InsertStudy): Promise<Study> {
    const id = randomUUID();
    const now = new Date();
    const study: Study = {
      ...insertStudy,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.studies.set(id, study);
    return study;
  }

  async updateStudy(id: string, updates: Partial<Study>): Promise<Study | undefined> {
    const study = this.studies.get(id);
    if (!study) return undefined;
    
    const updatedStudy: Study = {
      ...study,
      ...updates,
      updatedAt: new Date()
    };
    this.studies.set(id, updatedStudy);
    return updatedStudy;
  }

  async deleteStudy(id: string): Promise<boolean> {
    return this.studies.delete(id);
  }

  async getParticipant(id: string): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipantsByStudy(studyId: string): Promise<Participant[]> {
    return Array.from(this.participants.values())
      .filter(participant => participant.studyId === studyId);
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = randomUUID();
    const participant: Participant = {
      ...insertParticipant,
      id,
      startedAt: new Date()
    };
    this.participants.set(id, participant);
    return participant;
  }

  async updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    const participant = this.participants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant: Participant = {
      ...participant,
      ...updates
    };
    this.participants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async getResponsesByParticipant(participantId: string): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter(response => response.participantId === participantId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async getResponsesByStudy(studyId: string): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter(response => response.studyId === studyId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const response: Response = {
      ...insertResponse,
      id,
      timestamp: new Date()
    };
    this.responses.set(id, response);
    return response;
  }

  async getStudyStats(studyId: string): Promise<{
    totalParticipants: number;
    completedParticipants: number;
    completionRate: number;
    totalResponses: number;
  }> {
    const participants = await this.getParticipantsByStudy(studyId);
    const responses = await this.getResponsesByStudy(studyId);
    
    const totalParticipants = participants.length;
    const completedParticipants = participants.filter(p => p.status === "completed").length;
    const completionRate = totalParticipants > 0 ? (completedParticipants / totalParticipants) * 100 : 0;
    const totalResponses = responses.length;

    return {
      totalParticipants,
      completedParticipants,
      completionRate,
      totalResponses
    };
  }
}

export const storage = new MemStorage();
