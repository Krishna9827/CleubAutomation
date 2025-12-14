import type { Metadata } from 'next';
import ProjectPlanningClient from './ProjectPlanningClient';

export const metadata: Metadata = {
  title: 'Project Planning | Cleub Automation',
  description: 'Start planning your smart home automation project with Cleub Automation. Enter client and project details to begin.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProjectPlanningPage() {
  return <ProjectPlanningClient />;
}
