# Photo Upload Feature Setup Guide

This guide will help you set up the photo upload feature for the monastery directory.

## 1. Database Migration

First, you need to add the `photos` column to your `monasteries` table in Supabase:

### Option A: Using the SQL Editor in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Run the following SQL command:

```sql
-- Add photos column to monasteries table
ALTER TABLE monasteries ADD COLUMN photos text[];

-- Add comment to describe the column
COMMENT ON COLUMN monasteries.photos IS 'Array of photo URLs for the monastery/center (max 5 photos)';
```

### Option B: Using the provided migration file
Run the SQL commands in `migration_add_photos_column.sql`

## 2. Supabase Storage Setup

### Create Storage Bucket
1. Go to your Supabase project dashboard
2. Navigate to "Storage"
3. Create a new bucket named `photos`
4. Make it public by enabling "Public bucket" option

### Set up Storage Policies
Add the following RLS policies for the photos bucket:

```sql
-- Allow public read access to photos
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'photos');

-- Allow authenticated users to delete photos (for editing)
CREATE POLICY "Users can delete photos" ON storage.objects
FOR DELETE USING (bucket_id = 'photos');
```

## 3. Environment Variables

Make sure you have the following environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 4. Add Placeholder Image

Add a placeholder image at `public/images/placeholder-image.png` for when photos fail to load. This should be a generic monastery or Buddhist center image.

## 5. Features Included

### Photo Upload Component
- Maximum 5 photos per monastery
- 5MB file size limit per photo
- Supports JPG, PNG, GIF, WebP formats
- Drag and drop interface
- Progress indicators and error handling

### Photo Gallery Component
- Navigation arrows for multiple photos
- Dot indicators for photo navigation
- Responsive design
- Photo counter display

### Integration Points
- **MonasteryCard**: Displays photo gallery at the top
- **Map Popup**: Shows first photo in marker popup
- **SuggestCenterForm**: Photo upload section after description
- **EditCenterForm**: Photo upload with deletion capability

### Photo Management
- First photo is designated as "Main" photo
- Edit mode allows photo deletion with confirmation modal
- Photos are automatically cleaned up from storage when deleted
- Failed uploads are handled gracefully

## 6. API Endpoints

The following API endpoints are created:

- `POST /api/upload-photo`: Upload a photo file
- `DELETE /api/upload-photo?path=<file_path>`: Delete a photo file

## 7. Database Schema Update

The `monasteries` table now includes:
- `photos`: `text[]` - Array of photo URLs (nullable)

## 8. Usage

### For Users
1. **Adding Photos**: Use the "Add Photos" button in suggest/edit forms
2. **Viewing Photos**: Navigate through photos using arrows or dots
3. **Main Photo**: The first photo appears on map markers
4. **Deleting Photos**: Click the X button on photos in edit mode

### For Developers
```typescript
// Access photos in components
const { photos } = monastery;

// Photo gallery usage
<PhotoGallery 
  photos={photos || []} 
  size="medium" 
  showCounter={true}
/>

// Photo upload usage
<PhotoUpload
  photos={photos || []}
  onPhotosChange={(newPhotos) => setPhotos(newPhotos)}
  maxPhotos={5}
/>
```

## 9. Troubleshooting

### Common Issues
1. **Photos not uploading**: Check storage bucket permissions and environment variables
2. **Photos not displaying**: Verify the photos bucket is public
3. **Large file sizes**: Ensure files are under 5MB limit
4. **CORS errors**: Make sure you're using the API route, not direct storage calls

### Error Messages
- "File too large": File exceeds 5MB limit
- "Only image files allowed": Non-image file selected
- "Maximum 5 photos allowed": Trying to upload more than 5 photos
- "Upload failed": General upload error (check console for details)

## 10. Future Enhancements

Potential improvements:
- Image compression before upload
- Multiple image formats/sizes for optimization
- Batch photo operations
- Photo reordering functionality
- Advanced photo editing features 