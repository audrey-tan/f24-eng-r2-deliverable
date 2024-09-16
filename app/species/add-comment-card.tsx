"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Use Zod to define the shape + requirements of a Species entry; used in form validation
const speciesSchema = z.object({
  content: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

type FormData = z.infer<typeof speciesSchema>;

export default function AddCommentCard({
  speciesId,
  username,
  sessionId,
}: {
  speciesId: number;
  username: string;
  sessionId: string;
}) {
  const router = useRouter();

  const defaultValues: Partial<FormData> = {
    content: "",
  };

  // Instantiate form functionality with React Hook Form, passing in the Zod schema (for validation) and default values
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (input: FormData) => {
    if (input.content === null) {
      return toast({
        title: "Cannot post an empty comment.",
        variant: "destructive",
      });
    }

    // The `input` prop contains data that has already been processed by zod. We can now use it in a supabase query
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.from("comment").insert([
      {
        authorId: sessionId,
        speciesId: speciesId,
        content: input.content,
      },
    ]);

    // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    // Because Supabase errors were caught above, the remainder of the function will only execute upon a successful edit

    // Reset form values to the default (empty) values.
    // Practically, this line can be removed because router.refresh() also resets the form. However, we left it as a reminder that you should generally consider form "cleanup" after an add/edit operation.
    form.reset(defaultValues);

    // Refresh all server components in the current route. This helps display the newly created species because species are fetched in a server component, species/page.tsx.
    // Refreshing that server component will display the new species from Supabase
    router.refresh();

    return toast({
      title: "Comment posted!",
    });
  };

  return (
    <div className="w-full min-w-72 flex-none rounded border-2 p-3 shadow">
      <div className="flex items-center">
        <Icons.user className="mb-3 mr-2 h-5 w-5" />
        <h3 className="mb-3 text-base font-semibold">{username}</h3>
      </div>
      <Form {...form}>
        <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(e)}>
          <div className="grid w-full items-center gap-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => {
                // We must extract value from field and convert a potential defaultValue of `null` to "" because textareas can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                const { value, ...rest } = field;
                return (
                  <FormItem>
                    <FormControl>
                      <Textarea value={value ?? ""} placeholder="Write a comment..." {...rest} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className="flex justify-end">
              <Button type="submit" className="ml-1 mr-1 flex-auto">
                Post
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
