# CogResearcher 🧠🔬

A comprehensive cognitive research platform that empowers researchers to design, conduct, and analyze psychological experiments with unprecedented ease and flexibility.

## 🌟 What is CogResearcher?

CogResearcher is a modern, web-based platform that revolutionizes how cognitive psychology research is conducted. It combines the power of AI-assisted experiment design with a drag-and-drop interface, making it possible for researchers of all technical levels to create sophisticated psychological studies in minutes rather than months.

### The Problem We Solve

Imagine Dr. Sarah Chen, a brilliant cognitive psychologist who just discovered a fascinating pattern in how people process emotional faces. She's excited to test her hypothesis that anxiety affects facial recognition differently in various age groups. But here's the reality she faces:

**The Traditional Path (6-12 months):**
- **Week 1-4**: Learning E-Prime programming from scratch (she's never coded before)
- **Week 5-8**: Building the experiment interface, debugging display timing issues
- **Week 9-12**: Testing with colleagues, fixing bugs, ensuring millisecond precision
- **Week 13-16**: IRB approval process (delayed because of technical complexity)
- **Week 17-20**: Pilot testing, more debugging, participant recruitment
- **Week 21-24**: Finally running the actual study

**Meanwhile, her research question grows stale, funding deadlines approach, and competitors might publish first.**

**What if Dr. Chen could:**
- **Day 1**: Describe her experiment in plain English: "I want to show emotional faces to participants and measure their reaction times, with anxiety levels as a moderator"
- **Day 2**: Use AI to automatically generate the perfect experimental design
- **Day 3**: Drag and drop components to customize the study
- **Day 4**: Deploy and start collecting data immediately

**That's the power of CogResearcher.**

Traditional cognitive research requires:
- **Complex programming** in specialized languages (E-Prime, PsychoPy, MATLAB)
- **Months of development time** for even simple experiments
- **Limited flexibility** once experiments are built
- **High technical barriers** that exclude many researchers
- **Fragmented data collection** across different platforms

**The human cost?** Brilliant ideas die on the vine. Promising research gets delayed indefinitely. Young researchers get discouraged. Breakthroughs that could help millions are postponed by years.

CogResearcher eliminates these barriers by providing an intuitive, web-based platform that democratizes cognitive research. We're not just building software—we're unlocking human potential, one researcher at a time.

## 🚀 Impact & Potential

### For Individual Researchers
- **10x faster experiment development** - Build studies in hours instead of months
- **No coding required** - Focus on research questions, not programming
- **Immediate deployment** - Run studies instantly across any device
- **Real-time data collection** - Monitor participant progress as it happens
- **Professional-grade experiments** - Access to validated cognitive tasks and measures

### For Research Institutions
- **Cost reduction** - Eliminate need for expensive proprietary software licenses
- **Standardization** - Consistent methodology across research teams
- **Collaboration** - Share and replicate studies easily
- **Accessibility** - Enable researchers without technical backgrounds to conduct studies
- **Scalability** - Run multiple studies simultaneously with unlimited participants

### For the Scientific Community
- **Reproducibility** - Open, transparent experiment designs
- **Data sharing** - Standardized data formats for meta-analyses
- **Methodological innovation** - Rapid prototyping of new experimental paradigms
- **Global accessibility** - Platform works on any device with internet access
- **Open science** - Contribute to the democratization of research

### Broader Societal Impact
- **Accelerated discovery** - Faster research means faster scientific breakthroughs
- **Inclusive research** - Enable diverse perspectives in cognitive science
- **Educational applications** - Teach experimental methods in classrooms
- **Clinical research** - Faster development of cognitive assessment tools
- **Industry applications** - User experience research, product testing, and more

## 🏗️ Architecture & Technical Details

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern development experience
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** with custom UI components for consistent, beautiful interfaces
- **Radix UI** primitives for accessible, unstyled components
- **Framer Motion** for smooth animations and transitions
- **React Hook Form** with Zod validation for robust form handling

### Backend Architecture
- **Express.js** server with TypeScript for robust API endpoints
- **WebSocket support** for real-time communication during experiments
- **Session management** with secure participant tracking
- **RESTful API** design following best practices
- **Middleware architecture** for authentication, validation, and error handling

### Database & Storage
- **PostgreSQL** with Neon serverless for scalable, reliable data storage
- **Drizzle ORM** for type-safe database operations
- **JSONB fields** for flexible experiment configuration storage
- **Optimized schemas** for fast query performance
- **Automatic migrations** with Drizzle Kit

### Key Features

#### 1. AI-Assisted Experiment Design
- **Natural language prompts** for experiment creation
- **Intelligent task generation** based on research requirements
- **Automatic validation** of experimental designs
- **Smart suggestions** for improving study methodology

#### 2. Drag-and-Drop Experiment Builder
- **Visual experiment canvas** for intuitive design
- **Component palette** with pre-built cognitive tasks
- **Real-time preview** of experiment flow
- **Conditional logic** for complex experimental designs

#### 3. Built-in Cognitive Tasks
- **Stroop Task** - Classic cognitive interference measure
- **Image Recall** - Memory and recognition tasks
- **Survey Components** - Customizable questionnaires
- **Consent & Demographics** - Standard research forms
- **Extensible framework** for custom task development

#### 4. Participant Management
- **Anonymous participation** with secure session tracking
- **Progress monitoring** in real-time
- **Data export** in multiple formats (CSV, JSON, SPSS)
- **Participant analytics** and completion rates

#### 5. Data Collection & Analysis
- **High-precision timing** for reaction time measures
- **Response accuracy** tracking and validation
- **Stimulus presentation** with millisecond precision
- **Comprehensive logging** of all experimental events

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CogResearcher

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cogresearcher
SESSION_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
NODE_ENV=development
PORT=5000
```

### Database Setup
```bash
# Push schema to database
npm run db:push

# Generate migrations (if needed)
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 📚 Usage Examples

### Creating a Simple Stroop Study

1. **Navigate to Study Builder**
   - Click "Create New Study" on dashboard
   - Choose "Stroop Task" template

2. **Configure Experiment**
   - Set trial count (e.g., 40 trials)
   - Choose conditions (congruent/incongruent)
   - Set timing parameters

3. **Add Consent & Demographics**
   - Drag consent form component
   - Add demographics questionnaire
   - Configure debrief message

4. **Deploy & Share**
   - Save study configuration
   - Generate participation link
   - Share with participants

### AI-Assisted Study Creation

```typescript
// Example AI prompt for creating a memory study
const aiPrompt = {
  taskType: "memory",
  title: "Visual Working Memory Capacity",
  customRequirements: "Measure working memory span with visual stimuli",
  estimatedDuration: 20,
  imageCount: 8
};
```

## 🔧 Development

### Project Structure
```
CogResearcher/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                 # Express.js backend
│   ├── routes/            # API endpoints
│   ├── agents/            # AI integration
│   └── storage/           # Database operations
├── shared/                 # Shared schemas and types
└── drizzle.config.ts      # Database configuration
```

### Key Development Commands
```bash
# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push
npm run db:generate
npm run db:migrate
```

### Adding New Cognitive Tasks

1. **Create Task Component**
   ```typescript
   // src/components/tasks/new-task.tsx
   interface NewTaskProps {
     config: NewTaskConfig;
     onResponse: (data: any) => void;
     onComplete: () => void;
   }
   ```

2. **Add to Component Palette**
   ```typescript
   // src/components/component-palette.tsx
   const taskTypes = [
     // ... existing tasks
     { type: "new-task", label: "New Task", icon: NewTaskIcon }
   ];
   ```

3. **Update Schema**
   ```typescript
   // shared/schema.ts
   blockType: text("block_type").notNull(), // Add new task type
   ```

## 🧪 Research Applications

### Cognitive Psychology
- **Attention research** - Stroop, flanker, and visual search tasks
- **Memory studies** - Working memory, episodic memory, recognition
- **Executive function** - Task switching, inhibition, planning
- **Perception** - Visual and auditory processing tasks

### Clinical Research
- **Cognitive assessment** - Screening and monitoring tools
- **Intervention studies** - Pre/post cognitive training measures
- **Population studies** - Age-related cognitive changes
- **Disorder research** - ADHD, dementia, brain injury assessment

### Educational Research
- **Learning studies** - Knowledge acquisition and retention
- **Skill development** - Cognitive skill training research
- **Classroom applications** - Educational psychology research
- **Assessment tools** - Cognitive ability measurement

### Industry Applications
- **User experience research** - Interface usability studies
- **Product testing** - Cognitive load and attention measures
- **Training evaluation** - Learning effectiveness research
- **Market research** - Consumer behavior and decision-making

## 🔒 Security & Privacy

### Data Protection
- **Anonymous participation** - No personally identifiable information required
- **Secure sessions** - Encrypted session management
- **Data encryption** - All data encrypted in transit and at rest
- **Access controls** - Role-based permissions for researchers

### Compliance
- **GDPR compliance** - European data protection standards
- **IRB compatibility** - Institutional Review Board approval support
- **Data retention** - Configurable data retention policies
- **Export controls** - Secure data export and deletion

## 🌐 Deployment

### Production Deployment
```bash
# Build application
npm run build

# Start production server
npm start

# Environment variables for production
NODE_ENV=production
PORT=5000
DATABASE_URL=your-production-db-url
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Cloud Deployment Options
- **Vercel** - Frontend deployment with serverless functions
- **Railway** - Full-stack deployment with PostgreSQL
- **Heroku** - Traditional hosting with add-ons
- **AWS/GCP** - Enterprise-grade cloud infrastructure

## 🤝 Contributing

We welcome contributions from researchers, developers, and cognitive science enthusiasts!

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** with inline comments explaining modifications
4. **Test thoroughly** - ensure all functionality works
5. **Submit a pull request** with detailed description

### Development Guidelines
- **Follow TypeScript best practices**
- **Add comprehensive tests** for new features
- **Document all API changes**
- **Use conventional commit messages**
- **Include inline comments** for complex logic

### Areas for Contribution
- **New cognitive tasks** - Implement additional experimental paradigms
- **Data analysis tools** - Statistical analysis and visualization
- **Mobile optimization** - Improve mobile device experience
- **Accessibility** - Enhance accessibility features
- **Documentation** - Improve user guides and tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Cognitive psychology researchers** who inspired this platform
- **Open source community** for the amazing tools and libraries
- **Academic institutions** supporting open science initiatives
- **Early adopters** providing valuable feedback and testing

## 📞 Support & Contact

- **Documentation**: [docs.cogresearcher.com](https://docs.cogresearcher.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/cogresearcher/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/cogresearcher/discussions)
- **Email**: support@cogresearcher.com

---

**CogResearcher** - Democratizing cognitive research, one experiment at a time. 🧠✨

*Built with ❤️ by researchers, for researchers.*
