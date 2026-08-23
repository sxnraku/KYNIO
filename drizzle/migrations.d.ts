interface MigrationJournalEntry {
  breakpoints: boolean;
  idx: number;
  tag: string;
  when: number;
}

interface ExpoMigrations {
  journal: {
    entries: MigrationJournalEntry[];
  };
  migrations: Record<string, string>;
}

declare const migrations: ExpoMigrations;

export default migrations;
