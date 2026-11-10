import { languageAlternates } from '@/i18n/routing';
import type { Metadata } from 'next';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: "Демо кухни — рецептуры и себестоимость порций",
  description: "Изучите примеры карточек блюд, рецептур, цен ингредиентов и маржи. Откройте инструменты управления кухней.",
  alternates: { canonical: "/ru/demo/kuchnia_demo", languages: languageAlternates("/ru/demo/kuchnia_demo") },
  openGraph: { title: "Демо кухни — рецептуры и себестоимость порций", description: "Изучите примеры карточек блюд, рецептур, цен ингредиентов и маржи. Откройте инструменты управления кухней.", url: "/ru/demo/kuchnia_demo" },
};

export default function Page() { return <MenuClient />; }
