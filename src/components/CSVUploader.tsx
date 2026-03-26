import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CSVUploaderProps {
  onParsed: (headers: string[], rows: Record<string, string>[]) => void;
}

export function CSVUploader({ onParsed }: CSVUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parse = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    setError(null);
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const headers = results.meta.fields ?? [];
        if (headers.length === 0) {
          setError("CSV appears to have no headers.");
          return;
        }
        onParsed(headers, results.data);
      },
      error(err) {
        setError(`Parse error: ${err.message}`);
      },
    });
  }, [onParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parse(file);
  }, [parse]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parse(file);
  }, [parse]);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-10 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
      )}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center gap-3">
        {fileName ? (
          <>
            <FileText className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium font-mono">{fileName}</p>
            <p className="text-xs text-muted-foreground">Parsing…</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Drag & drop your orders CSV here</p>
            <p className="text-xs text-muted-foreground">
              Expects: order ID, customer ID, product title/SKU, order date, order value
            </p>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Choose file
            </Button>
          </>
        )}
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
