import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EquipmentLog {
  description: string;
}

interface Props {
  logs: EquipmentLog[];
  setLogs: (logs: EquipmentLog[]) => void;
}

/**
 * EquipmentLogsSection renders a list of Equipment log entries with a description field.
 */
export default function EquipmentLogsSection({ logs, setLogs }: Props) {
  return (
    <div className="col-span-2 border rounded p-4 mt-2">
      <h3 className="font-semibold mb-2">Equipment Logs</h3>
      {logs.map((log, idx) => (
        <div key={idx} className="flex gap-2 mb-2">
          <Input
            type="text"
            placeholder="Description"
            value={log.description}
            onChange={(e) => {
              const updated = [...logs];
              updated[idx].description = e.target.value;
              setLogs(updated);
            }}
          />
          <Button
            type="button"
            variant="destructive"
            onClick={() => setLogs(logs.filter((_, i) => i !== idx))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        onClick={() => setLogs([...logs, { description: "" }])}
      >
        Add Equipment Log
      </Button>
    </div>
  );
}
