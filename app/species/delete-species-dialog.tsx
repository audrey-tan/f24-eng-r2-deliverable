"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";
type Species = Database["public"]["Tables"]["species"]["Row"];

export default function DeleteSpeciesDialog({ species }: { species: Species }) {
  const router = useRouter();

  // Control open/closed state of the dialog
  const [open, setOpen] = useState<boolean>(false);

  const onDelete = async () => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("species").delete().eq("id", species.id);

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    setOpen(false);

    // Refresh all server components in the current route. This helps display the newly created species because species are fetched in a server component, species/page.tsx.
    // Refreshing that server component will display the new species from Supabase
    router.refresh();

    return toast({
      title: "Species deleted!",
      description: "Successfully deleted " + species.scientific_name + ".",
    });
  };

  const handleClick = () => {
    void onDelete();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button type="submit" variant="destructive" className="mb-6 ml-1">
          <Icons.trash className="mr-3 h-5 w-5" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this species?</DialogTitle>
          <DialogDescription>You cannot undo this action.</DialogDescription>
        </DialogHeader>
        <div className="mt-3 flex">
          <Button type="submit" variant="destructive" className="ml-1 mr-1 flex-auto" onClick={handleClick}>
            Delete Species
          </Button>
          <DialogClose asChild>
            <Button type="button" className="ml-1 mr-1 flex-auto" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
