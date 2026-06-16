interface ExternalPostSourceBadgeProps {
  source: string;
}

export function ExternalPostSourceBadge({ source }: ExternalPostSourceBadgeProps) {
  return (
    <span className="inline-flex max-w-40 items-center rounded-sm bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
      <span className="truncate">{source}</span>
    </span>
  );
}
