import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { createClient } from '@/lib/supabase/server';

const f = createUploadthing();
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route slug
  shipIcon: f({ image: { maxFileSize: "1MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({}) => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
 
      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");
 
      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
  shipCover: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({}) => {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new UploadThingError("Unauthorized");
        return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
        console.log("Cover image upload complete for userId:", metadata.userId);
        console.log("Cover image url", file.url);
        return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter; 