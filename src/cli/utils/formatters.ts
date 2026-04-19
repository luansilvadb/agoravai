export interface PreviewItem {
  action: 'create' | 'update' | 'delete' | 'move' | 'archive';
  path: string;
  description?: string;
}

export interface PreviewSummary {
  title: string;
  items: PreviewItem[];
}

export function formatPreview(summary: PreviewSummary): string {
  const lines: string[] = [`[DRY-RUN] ${summary.title}`, ''];

  const icons: Record<PreviewItem['action'], string> = {
    create: '+',
    update: '~',
    delete: '-',
    move: '→',
    archive: '▒',
  };

  for (const item of summary.items) {
    const icon = icons[item.action];
    const desc = item.description ? ` (${item.description})` : '';
    lines.push(`  ${icon} ${item.path}${desc}`);
  }

  lines.push('');
  lines.push(`No changes applied. Remove --dry-run to execute.`);

  return lines.join('\n');
}

export function formatSimplePreview(
  action: string,
  target: string,
  details?: string[]
): string {
  const lines: string[] = [`[DRY-RUN] ${action}`, '', `  Target: ${target}`];

  if (details && details.length > 0) {
    lines.push('');
    for (const detail of details) {
      lines.push(`  - ${detail}`);
    }
  }

  lines.push('');
  lines.push('No changes applied. Remove --dry-run to execute.');

  return lines.join('\n');
}
