import { Metadata } from 'next';
import CopilotClient from './CopilotClient';

export const metadata: Metadata = {
  title: 'Career Copilot | Campus Lenz',
  description: 'AI-powered career mentor and placement strategist grounded in verified campus data.',
};

export default function CopilotPage() {
  return <CopilotClient />;
}
