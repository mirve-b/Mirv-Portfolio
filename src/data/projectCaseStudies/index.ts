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

export async function loadCaseStudyForProject(
  _projectId: string,
): Promise<ProjectCaseStudy | undefined> {
  return undefined
}
