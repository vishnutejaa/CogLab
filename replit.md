# Overview

CogLab is a comprehensive web-based platform for creating, managing, and conducting cognitive psychology experiments. The application provides researchers with an intuitive interface to build experimental studies, manage participants, and collect psychological data through various cognitive tasks like Stroop tests and image recall experiments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
- **Server**: Express.js with TypeScript for the REST API
- **Storage**: In-memory storage implementation with interface for future database integration
- **Session Management**: Simple session-based authentication with default user
- **API Design**: RESTful endpoints for studies, participants, responses, and analytics

## Database Schema Design
The system uses Drizzle ORM with PostgreSQL-compatible schema definitions:
- **Users**: Authentication and researcher profiles
- **Studies**: Experimental designs with configurable blocks and conditions
- **Participants**: Session tracking and demographic data
- **Responses**: Experimental data collection with timing and accuracy metrics

## Experimental Framework
- **Block-based Design**: Modular experiment components (consent, demographics, tasks, surveys)
- **Task Types**: Built-in support for Stroop tasks, image recall, surveys, and instructions
- **Data Collection**: Comprehensive response tracking with timing and accuracy metrics
- **Study Builder**: Drag-and-drop interface for experiment construction

## Development Architecture
- **Monorepo Structure**: Shared schema and utilities between client and server
- **Development Server**: Hot reload with Vite integration
- **Build Process**: Separate client and server builds with ESM module support
- **Type Safety**: End-to-end TypeScript with shared types

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity (configured but using in-memory storage currently)
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **express**: Web server framework
- **react**: Frontend framework

## UI and Styling
- **@radix-ui/***: Accessible UI primitive components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for development
- **esbuild**: JavaScript bundling for production

## Cognitive Task Libraries
- **date-fns**: Date manipulation utilities
- **embla-carousel-react**: Carousel components for task interfaces
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type validation and schema definition