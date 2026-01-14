import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AISearchDialog } from "./AISearchDialog";

export const AISearchButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">AI-подбор</span>
      </Button>
      <AISearchDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
