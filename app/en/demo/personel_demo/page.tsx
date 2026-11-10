import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import StaffClient from './StaffClient';

export const metadata: Metadata = {
  title: "Staff demo — schedules and pay",
  description: "Explore the team, schedule and payroll calculator. Compare hours and costs in the interactive demo.",
  alternates: { canonical: '/demo/personel_demo', languages: languageAlternates('/demo/personel_demo') },
  openGraph: { title: "Staff demo — schedules and pay", description: "Explore the team, schedule and payroll calculator. Compare hours and costs in the interactive demo.", url: '/demo/personel_demo' },
};

export default function Page() { return <StaffClient />; }
