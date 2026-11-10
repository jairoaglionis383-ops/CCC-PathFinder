import { CHANNELS } from '../../constants/learningContent';

// External "Watch on YouTube" link. Opens in a new tab with noopener.
export default function ResourceLink({ resource, ui, lang, compact = false }) {
  const channel = CHANNELS[resource.channel];
  if (compact) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-small text-sky-ink underline underline-offset-2 hover:text-navy"
      >
        {channel.name}: {resource.topic[lang]} ↗
      </a>
    );
  }
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-md bg-sky-ink px-4 py-2 text-small font-medium text-white shadow-1 hover:bg-sky-ink/95"
    >
      {ui.watch} ↗
    </a>
  );
}
