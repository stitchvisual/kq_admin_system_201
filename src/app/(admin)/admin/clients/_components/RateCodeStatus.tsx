import { colors } from '@/styles/botanical';

interface RateCodeStatusProps {
  weekday?: string | null;
  saturday?: string | null;
  sunday?: string | null;
}

export function RateCodeStatus({ weekday, saturday, sunday }: RateCodeStatusProps) {
  const green = colors.primaryBase;
  const amber = '#b69470';

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: weekday ? green : amber }}
        title={`Weekday: ${weekday ? 'Assigned' : 'Not set'}`}
      />
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: saturday ? green : amber }}
        title={`Saturday: ${saturday ? 'Assigned' : 'Not set'}`}
      />
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: sunday ? green : amber }}
        title={`Sunday: ${sunday ? 'Assigned' : 'Not set'}`}
      />
    </div>
  );
}