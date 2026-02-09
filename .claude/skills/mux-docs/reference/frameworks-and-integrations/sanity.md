# Integrate with Sanity

**Source:** https://mux.com/docs/_guides/integrations/sanity

This guide assumes you already have a Sanity Studio set up. If you haven't created your Sanity Studio yet, follow the Sanity Studio quickstart guide to get started.

1. Install Mux plugin

Run this command in your Sanity project folder:


```sh
npm i sanity-plugin-mux-input
```


2. Use in a schema

To use Mux video in your Sanity schemas, you'll need to create a schema type, import it to your schema types index, and configure the Mux plugin in your Sanity configuration file.

2.1. Create a schema type

Create a new file in your schemaTypes directory (or schemas directory, depending on your setup). For example, create a file called videoBlogPost.ts:


```typescript
// schemaTypes/videoBlogPost.ts
import { defineType, defineField } from 'sanity'

export default defineType({
  title: 'Video blog post',
  name: 'videoBlogPost',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title'
    }),
    defineField({
      name: 'video',
      type: 'mux.video',
      title: 'Video file'
    })
  ]
})
```


2.2. Import the schema type

Import your new schema type in your schema types index file (usually schemaTypes/index.ts or schemas/index.ts):


```typescript
// schemaTypes/index.ts
import videoBlogPost from './videoBlogPost'

export const schemaTypes = [videoBlogPost]
```


2.3. Configure the Mux plugin

Add the Mux plugin to your Sanity configuration file (sanity.config.ts or sanity.config.js):


```typescript
// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { muxInput } from 'sanity-plugin-mux-input'
import { schemaTypes } from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'My Sanity Project',

  projectId: 'your-project-id',
  dataset: 'production',

  plugins: [
    structureTool(),
    muxInput()
  ],

  schema: {
    types: schemaTypes,
  },
})
```


3. Enter Mux credentials

Generate a new Access Token by going to the Access Token settings of your Mux account dashboard.

The access token should have Mux Video Read and Write permissions as well as Mux Data (read-only).
If you want to use signed playback, you need to enable both Read and Write permissions for the System section. For more information, check out the Signed Tokens section.

Back in Sanity Studio, navigate to the Videos section in your studio menu, then click on Configure plugin. Enter your Access Token ID and Secret Key in the configuration settings.

You'll also see an option to Enable signed URLs. This feature allows you to create videos with signed playback policies for additional security. If you're unsure, you can leave this disabled for now—you can learn more about this feature in the Signed Tokens section below.

4. Upload video

Use the select button to open the file explorer on your system, drag the file right into the input area, or paste the URL to the video in the field. Once it's done uploading, you can select the thumbnail you want for the preview.

You now have the ability to upload content to Mux through Sanity CMS!

To retrieve your video for playback, check out the Sanity docs for instructions.

5. Explore advanced options

Signed Tokens

Enabling signed URLs in Sanity will require you to generate your own signing tokens on your application server. This involves creating a signing key and using that to generate JSON web tokens when you want to access your videos and thumbnails outside of Sanity.

By default, all assets uploaded to Mux through Sanity will be created with a playback policy of "public". This means that your videos and thumbnails are accessible with https://stream.mux.com/{PLAYBACK_ID}.m3u8 and https://image.mux.com/{PLAYBACK_ID}/thumbnail.jpg.

If you want more control over delivery of the playback and thumbnail access, you can enable this feature on the Sanity configuration popover:

When you enable this feature, the following things will happen:

1. The Mux Plugin in Sanity will use the Mux API to create a URL signing key and save this with your secrets document.
2. Any assets that get created while this feature is enabled will be created with playback_policy: "signed" (instead of "public").
3. The signing key from Step 1 will be used by the Mux Plugin to preview content inside the Sanity UI.
4. When you access your content in your own application, use the MuxAsset.data.playback_ids property to determine if the asset has a signed or public policy.


```json
{
  "_id": "0779365f-bbd1-46ab-9d78-c55feeb28faa",
  "_type": "mux.videoAsset",
  "assetId": "fNMFNYMq48EwgJM7AIn1rNldiFBcVIdK",
  "data": {
    "playback_ids": [
      {
        "id": "01cBJKm5KoeQii00YYGU7Rvpzvh6V01l4ZK",
        "policy": "public"
      }
    ]
  },
  "status": "ready"
}
```


5. You should use the signed playbackId to create URLs for playback and for thumbnail generation.

- Playback https://stream.mux.com/{SIGNED_PLAYBACK_ID}.m3u8?token={TOKEN}
- Thumbnails https://image.mux.com/{SIGNED_PLAYBACK_ID}/thumbnail.jpg?token={TOKEN}

6. The TOKEN parameter for the above URLs is something you create on your server according to Step 2 in Secure video playback

Note that in the Sanity UI when an asset is using a signed URL you will see this green notice.

Encoding Tiers

When uploading a new video, you can select which Encoding Tier is used when preparing the Asset. Possible selections are Smart and Baseline. When choosing Smart, additional options are made available for maximum resolutions (1080p, 2K or 4K).

More details can be found in our Use Encoding Tiers guide.

Static Renditions

When using the Smart Encoding Tier, an option to enable downloadable MP4s will be available. This option will create Static Renditions for the Asset and will make MP4 files available for download to client devices using a formatted URL.

Max Video Resolution

You can specify the maximum resolution to encode the uploaded video. This option is particularly important in managing costs when uploaded videos are higher than 1080p resolution and also allows you to encode and play videos in 2k or 4k resolutions.
More information on the feature is available in our docs. Also, read more on this feature announcement in our blog post.

Captions and Subtitles

You can add captions to your videos in two ways: during the initial upload or after the video has been uploaded. Both auto-generated and custom captions are supported, and you can use both types on the same asset.

Adding captions during upload

When uploading a new video, you can configure auto-generated captions in the upload modal before the file is uploaded to Mux. This allows you to set up auto-generated captions right from the start.

Adding captions to existing videos

For videos that have already been uploaded, you can add or manage captions in two ways:

- From the Videos section: Go to Videos in your studio menu, find the video in the list, and open it to view its details and caption options.
- From the document: Open the document that contains the video field, click the three-dots menu on the video input, then select Captions.

Types of captions

Auto-generated captions

For auto-generated captions, select the language of the spoken audio in the video. Mux will generate the captions automatically while it prepares the asset. The display name you choose is what will appear in the player when users select the caption track.

The auto-generated option should only be used to generate one caption track per asset. The language selected must match the spoken language in the video.

More details: Add auto-generated captions and use transcripts.

Custom captions

You can add custom captions and subtitles by providing a public URL to a .vtt or .srt file. Enter the URL in the caption configuration and set the caption name and language. You can host the file in Sanity's Media Library or any other public URL.

More details: Add subtitles/captions to videos.

Managing captions

Caption tracks can be added and removed at any time. Changes are reflected in the stored asset data. If you need to edit auto-generated captions, you can download the VTT file, make your edits, and re-upload it as a custom caption.

Release notes

Current release

v2.14.0

- Add pagination in "Videos" library
- Add text tracks management

Previous releases

See GitHub
