export interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  fee: number;
  eligibility: string;
  seats: number;
  enrolled: number;
  status: "active" | "draft" | "closed";
  startDate: string;
  endDate: string;
  pipelineId: string;
  tags: string[];
}

export const programs: Program[] = [
  {
    id: "prog_001",
    title: "Product Management",
    description: "An intensive 12-week internship covering product strategy, roadmap planning, user research, and go-to-market frameworks.",
    duration: "12 weeks",
    fee: 12000,
    eligibility: "Engineering / MBA graduates",
    seats: 30,
    enrolled: 24,
    status: "active",
    startDate: "2026-05-01",
    endDate: "2026-07-31",
    pipelineId: "pipe_001",
    tags: ["Strategy", "Research", "B2B"],
  },
  {
    id: "prog_002",
    title: "UI/UX Design",
    description: "Master user-centred design principles, Figma prototyping, usability testing, and design systems over 10 weeks.",
    duration: "10 weeks",
    fee: 9500,
    eligibility: "Design / CS graduates",
    seats: 20,
    enrolled: 18,
    status: "active",
    startDate: "2026-05-15",
    endDate: "2026-07-24",
    pipelineId: "pipe_001",
    tags: ["Figma", "Research", "Design Systems"],
  },
  {
    id: "prog_003",
    title: "Data Science",
    description: "Hands-on internship covering Python, ML pipelines, data storytelling, and real-world analytics projects.",
    duration: "14 weeks",
    fee: 15000,
    eligibility: "CS / Statistics graduates",
    seats: 25,
    enrolled: 20,
    status: "active",
    startDate: "2026-04-20",
    endDate: "2026-07-25",
    pipelineId: "pipe_002",
    tags: ["Python", "ML", "Analytics"],
  },
  {
    id: "prog_004",
    title: "Growth Marketing",
    description: "Learn performance marketing, SEO/SEM, content strategy, and analytics through live campaign execution.",
    duration: "8 weeks",
    fee: 8000,
    eligibility: "Any graduate",
    seats: 40,
    enrolled: 28,
    status: "active",
    startDate: "2026-06-01",
    endDate: "2026-07-26",
    pipelineId: "pipe_001",
    tags: ["SEO", "Performance", "Analytics"],
  },
  {
    id: "prog_005",
    title: "Business Development",
    description: "Build sales strategy, lead generation, and partnership frameworks in a fast-paced startup environment.",
    duration: "10 weeks",
    fee: 10000,
    eligibility: "MBA / BBA graduates",
    seats: 15,
    enrolled: 0,
    status: "draft",
    startDate: "2026-07-01",
    endDate: "2026-09-09",
    pipelineId: "pipe_002",
    tags: ["Sales", "Partnerships", "Strategy"],
  },
];
