import caseStudyImg from '../assets/DEV/Case_study.png'
import cvImg from '../assets/DEV/CV.png'
import jobMatchImg from '../assets/DEV/Job_match.png'
import profileImg from '../assets/DEV/pfp_kael.png'
import portfolioTemplateImg from '../assets/DEV/portfolio_template.png'

export type CaseStudySection = {
  id: string
  title: string
  paragraphs?: string[]
  bullets?: string[]
  flow?: string[]
  image?: string
  imageCaption?: string
}

export type ProjectCaseStudy = {
  projectId: string
  sections: CaseStudySection[]
  technologies: string[]
  futureScope: string[]
}

export const PROJECT_CASE_STUDIES: Record<string, ProjectCaseStudy> = {
  kael: {
    projectId: 'kael',
    sections: [
      {
        id: 'introduction',
        title: 'Introduction',
        paragraphs: [
          'Students and professionals often struggle to turn scattered academic and project work into polished portfolios, resumes, and case studies — usually across separate tools with repeated manual effort.',
          'KAEL is an AI-powered platform that transforms raw project data into professional documentation, interactive portfolios, and ATS-compatible resumes inside one centralized academic library.',
        ],
      },
      {
        id: 'problem',
        title: 'Problem Statement',
        paragraphs: [
          'Traditional portfolio creation forces users to organize files, write descriptions, build case studies, and tailor CVs for every application — a repetitive process that penalizes strong builders who lack documentation time.',
          'KAEL automates this pipeline with AI, converting scattered material into structured career assets that stay in sync.',
        ],
      },
      {
        id: 'workflow',
        title: 'Overall Workflow',
        paragraphs: [
          'Each module feeds the next — generated outputs automatically enrich the user profile, portfolio, and resume without re-entering the same information.',
        ],
        flow: [
          'User Registration',
          'AI Profile Generation',
          'Project Upload',
          'AI Case Study Generation',
          'Portfolio Creation',
          'ATS CV Generation',
          'AI Job Match',
        ],
      },
      {
        id: 'profile',
        title: 'AI Profile Generation',
        paragraphs: [
          'Onboarding data is sent to the Google Gemini API to produce a reusable professional profile — biography, skills, education, and career summary — shared across resumes, portfolios, and case studies.',
        ],
        image: profileImg,
        imageCaption: 'Generated professional profile',
      },
      {
        id: 'case-study',
        title: 'Project Upload & Case Study Generation',
        paragraphs: [
          'Users upload PDFs, screenshots, designs, research, notes, and code snippets. KAEL stores the material securely and pairs it with the user profile for Gemini to generate a structured software engineering case study.',
        ],
        bullets: [
          'Overview & problem statement',
          'Objectives, methodology & design decisions',
          'Technologies, challenges, solutions & results',
        ],
        image: caseStudyImg,
        imageCaption: 'AI-generated case study editor',
      },
      {
        id: 'sync',
        title: 'Automatic Profile Synchronization',
        paragraphs: [
          'After each case study, KAEL detects new skills, technologies, responsibilities, and summaries — automatically enriching the profile so resumes and portfolios always reflect the latest work.',
        ],
      },
      {
        id: 'portfolio',
        title: 'AI Portfolio Generation',
        paragraphs: [
          'Saved case studies become an interactive portfolio. Users pick a template and KAEL arranges project thumbnails with consistent typography and layout — each opens the full case study.',
        ],
        image: portfolioTemplateImg,
        imageCaption: 'Portfolio template selection',
      },
      {
        id: 'cv',
        title: 'ATS CV Generation',
        paragraphs: [
          'Using the stored profile and case studies, KAEL builds an ATS-compatible CV with summaries, skills, education, experience, and project descriptions — no manual resume writing required.',
        ],
        image: cvImg,
        imageCaption: 'Generated ATS-compatible CV',
      },
      {
        id: 'job-match',
        title: 'AI Job Match',
        paragraphs: [
          'Users paste any job description and KAEL compares it against their profile, projects, and skills — returning a suitability score, gap analysis, matching highlights, and a tailored ATS CV in seconds.',
        ],
        image: jobMatchImg,
        imageCaption: 'Job match analysis & tailored CV',
      },
      {
        id: 'library',
        title: 'Academic E-Library',
        paragraphs: [
          'Every project, case study, resume, and portfolio lives in a centralized library — editable, regenerable, and expandable — turning KAEL into a long-term career development platform.',
        ],
      },
    ],
    technologies: [
      'Flutter Desktop',
      'Dart',
      'Firebase Authentication',
      'Cloud Firestore',
      'Firebase Storage',
      'Google Gemini API',
      'Provider',
      'REST APIs',
      'Git & GitHub',
    ],
    futureScope: [
      'Flutter Web portfolio publishing',
      'Recruiter dashboards & academic workspaces',
      'Collaborative project sharing & analytics',
      'AI interview preparation',
      'Cloud-hosted public portfolios with QR sharing',
    ],
  },
}

export function getCaseStudyForProject(
  projectId: string,
): ProjectCaseStudy | undefined {
  return PROJECT_CASE_STUDIES[projectId]
}
