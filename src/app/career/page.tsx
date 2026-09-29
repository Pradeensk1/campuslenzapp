import { Metadata } from 'next';
import CareerClient from './CareerClient';

export const metadata: Metadata = {
  title: 'AI Career Copilot | Campus Lenz',
  description: 'AI-driven placement preparation, skill gap analysis, and alumni referral pathways connected directly to your student profile database.'
};

export default function CareerPage() {
  return <CareerClient />;
}
