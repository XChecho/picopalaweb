'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { LEGAL_ENTITY, LEGAL_LAST_UPDATED } from '@/lib/legal';

export type TLegalDocument = 'terms' | 'privacy';

interface ILegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

interface LegalViewProps {
  document: TLegalDocument;
}

export const LegalView: React.FC<LegalViewProps> = ({ document }) => {
  const { t, i18n } = useTranslation('legal');
  const sections = t(`${document}.sections`, {
    returnObjects: true,
    owner: LEGAL_ENTITY.name,
    taxId: LEGAL_ENTITY.taxId,
    address: LEGAL_ENTITY.address,
    email: LEGAL_ENTITY.email,
  }) as ILegalSection[];
  const updated = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(LEGAL_LAST_UPDATED),
  );

  return (
    <article className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-['Cairo'] text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          {t(`${document}.title`)}
        </h1>
        <p className="text-xs text-[#a98891]">{t('lastUpdated', { date: updated })}</p>
        <p className="text-sm text-[#e2bdc7] leading-relaxed">{t(`${document}.intro`)}</p>
      </header>

      {sections.map((section, index) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h2 className="font-['Cairo'] text-lg sm:text-xl font-bold text-white">
            {index + 1}. {section.title}
          </h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="text-sm text-[#e2e2ea]/85 leading-relaxed">
              {paragraph}
            </p>
          ))}
          {section.items && (
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-[#e2e2ea]/85 leading-relaxed marker:text-[#ff479b]">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
};
