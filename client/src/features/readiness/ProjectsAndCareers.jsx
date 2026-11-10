import SectionShell from './SectionShell';

export default function ProjectsAndCareers({ projects, careers, ui, lang, colorKey }) {
  return (
    <SectionShell id="projects" title={ui.projectsTitle} colorKey={colorKey}>
      <ul className="flex flex-col gap-3">
        {projects.map((p, i) => (
          <li key={i} className="rounded-md border border-navy/10 p-4">
            <h3 className="font-display text-body font-bold text-navy">{p.title[lang]}</h3>
            <p className="mt-1 text-small text-gray-dark">{p.description[lang]}</p>
          </li>
        ))}
      </ul>
      <h3 className="mt-6 font-display text-body font-bold text-navy">{ui.careersTitle}</h3>
      <ul className="mt-2 list-disc pl-5 text-small text-gray-dark">
        {careers.map((c, i) => (
          <li key={i}>{c[lang]}</li>
        ))}
      </ul>
      <p className="mt-3 text-caption text-gray-dark">{ui.careersNote}</p>
    </SectionShell>
  );
}
